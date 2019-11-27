#!/bin/env python

# -*- coding: utf-8 -*-

import json
import logging
import os
from pathlib import Path
from typing import List, Tuple

from werkzeug import exceptions

from flask import Flask, jsonify, request, url_for
from flask_cors import CORS as FlaskCors
from flask_jwt_extended import (JWTManager, create_access_token,
                                create_refresh_token, get_jwt_claims,
                                get_jwt_identity, jwt_optional,
                                jwt_refresh_token_required, jwt_required)
from flask_restplus import Api, Resource, fields
from logit import get_logger
from exceptions import BadCredentials
from werkzeug.exceptions import BadRequest, Conflict, Unauthorized, NotFound, HTTPException

from config import config_by_name
from api_config import authorizations, config as swagger_config

from users import User, admins, brokers, everyone, get_user, save_user, check_user


logger = get_logger(__name__)

config_name = os.environ.get("ENVIRONMENT", "development")
app = Flask('Questions', static_folder=None)
app.config.from_object(config_by_name[config_name])

cors = FlaskCors(app)

api = Api(**swagger_config)
api.init_app(app)

auth_parser = api.parser()
auth_parser.add_argument('Authorization', location='headers')

# Setup the Flask-JWT-Extended extension
jwt = JWTManager(app)
jwt._set_error_handler_callbacks(api)


generic_error = api.model('GenericError', {
    'message': fields.String(required=True, description='A description of the error')
})

@app.before_request
def before_request():
    if request.method == "OPTIONS":
        return '', 200


@app.before_first_request
def init_app_context():
    pass



### START -- Auth methods
auth_ns = api.namespace('auth', description='Authentication')


def assert_admin():
    identity = get_jwt_identity()
    current_user = get_user(identity, admins)
    if not current_user:
        raise Unauthorized("Access denied, you're not an admin")
    return current_user


def assert_broker():
    identity = get_jwt_identity()
    current_user = get_user(identity, brokers)
    if not current_user:
        raise Unauthorized("Access denied, you have to be a broker to read this")
    return current_user


@jwt.expired_token_loader
def my_expired_token_callback(expired_token=None):
    error = Unauthorized("Access token expired")
    return error.get_response()


user_credentials = api.model('UserCredentials', {
    'access_token': fields.String(required=True, description='A temporary JWT'),
    'refresh_token': fields.String(required=True, description='A refresh token'),
    'email': fields.String(required=True, description='The email'),
    'name': fields.String(required=True, description='The name'),
    'role': fields.String(required=True, description='Role')
})


# Create a function that will be called whenever create_access_token
# is used. It will take whatever object is passed into the
# create_access_token method, and lets us define what custom claims
# should be added to the access token.
@jwt.user_claims_loader
def add_claims_to_access_token(user: User):
    return {'role': user.role}


# Create a function that will be called whenever create_access_token
# is used. It will take whatever object is passed into the
# create_access_token method, and lets us define what the identity
# of the access token should be.
@jwt.user_identity_loader
def user_identity_lookup(user: User):
    return user.email


def generate_login_response(user: User):
    if not user:
        return None
    return {
        'access_token': create_access_token(identity=user),
        'refresh_token': create_refresh_token(identity=user),
        'email': user.email,
        'name': user.name,
        'role': user.role
    }


@auth_ns.route('/register', methods=['POST'])
class RegisterResource(Resource):

    register_payload = api.model('RegisterPayload', {
        'name': fields.String(required=True, description='The user\'s name'),
        'email': fields.String(required=True, description='The email'),
        'password': fields.String(required=True, description='The password'),
    })

    @auth_ns.doc(body=register_payload, security=None)
    @auth_ns.marshal_with(user_credentials, code=200, description='Successful registration')
    @auth_ns.expect(register_payload)
    @auth_ns.response(400, "When any parameter is missing", generic_error)
    @auth_ns.response(409, "When there's a user already exists with given email", generic_error)
    def post(self):
        """
        Register a new user

        """
        name = api.payload.get('name', '').strip()
        email = api.payload.get('email', '').strip().lower()
        password = api.payload.get('password', '').strip()

        for value in [name, email, password]:
            if not value:
                raise BadRequest("Required fields: email, name, password")

        user = get_user(email, everyone)
        if user:
            return Conflict("Email exists")

        user = save_user(name, email, password)
        return generate_login_response(user), 200


# Provide a method to create access tokens. The create_access_token()
# function is used to actually generate the token, and you can return
# it to the caller however you choose.
@auth_ns.route('/login', methods=['POST'])
class LoginResource(Resource):

    login_payload = api.model('LoginPayload', {
        'email': fields.String(required=True, description='The email'),
        'password': fields.String(required=True, description='The password')
    })

    @auth_ns.doc(body=login_payload, security=None)
    @auth_ns.marshal_with(user_credentials, description='Login OK')
    @auth_ns.response(401, "Invalid credentials", generic_error)
    @api.expect(login_payload)
    def post(self):
        """
        Perform a login to access restricted API endpoints.

        :raises BadCredentials: In case of invalid credentials.
        """

        email = api.payload["email"]
        password = api.payload["password"]

        if not check_user(email, password):
            raise BadCredentials()

        user = get_user(email, everyone)
        return generate_login_response(user)


# The jwt_refresh_token_required decorator insures a valid refresh
# token is present in the request before calling this endpoint. We
# can use the get_jwt_identity() function to get the identity of
# the refresh token, and use the create_access_token() function again
# to make a new access token for this identity.
@auth_ns.route('/refresh', methods=['POST'])
class RefreshResource(Resource):

    refresh_payload = api.model('RefreshPayload', {
        'refresh_token': fields.String(required=True, description='The refresh token'),
    })

    refreshed_tokens = api.model('RefreshedToken', {
        'access_token': fields.String(description='A temporary JWT'),
    })

    @auth_ns.doc(body=refresh_payload, security=None, expect=[auth_parser])
    @auth_ns.marshal_with(refreshed_tokens, description='Refresh OK')
    @auth_ns.response(401, "Invalid JWT identity", generic_error)
    @jwt_refresh_token_required
    def post(self):
        """
        Refresh access token

        :raises Unauthorized: When JWT identity is invalid
        """
        current_user = get_user(get_jwt_identity(), everyone)
        if not current_user:
            raise Unauthorized("Invalid user")
        ret = {
            'access_token': create_access_token(identity=current_user),
        }
        return ret


### END -- Auth methods


### Begin -- Questions API

questions_ns = api.namespace('questions', description='Questions')


#Debo completar ambos serializadores con los campos correspondientes: son los que espero del front, también, los que voy a almacenar en la BD

submit_question_fields = api.model('AskAQuestion', {
})

question_fields = api.model('Question', {

})


@questions_ns.route('/questions')
class QuestionsResource(Resource):
    @questions_ns.doc('list_questions', expect=[auth_parser]) #documentacion del metodo
    @questions_ns.marshal_list_with(question_fields, code=200, description="Model list") #reciba los campos que esta esperando en el modelo 
    @questions_ns.response(401, "Access denied", generic_error)
    @jwt_required #este metodo requiere un token para poder ejecutarse. En header mando un Token y en Body el json
    def get(self):
        #"""
        #List available questions
        #"""

        #Con las anotations valido que lo que me mandan es correcto
        #Podria tener logica del negocio
        #Devuelvo todo lo que tengo en la BD/array
        #En caso de que sean muchos registros almacenados, podria filtrar por "cantidad de registros por pagina" que el usuario desea leer (ese dato se selecciona en el Front)
        #Validar que el Usuario/rol que esta haciendo esta request, tenga los permisos necesarios para poder ver los datos (Para mejorar la seguridad)
        #Con respecto al punto anterior, se aclara que los roles de tipo "Broker" podrian ver SOLO sus consultas, y no la de otros brokers.

        return 'hola'
        
        #assert_broker()
        ### TODO: brokers should only be able to read their own questions, not others'
        #return []

    @questions_ns.doc('ask_a_question', body=submit_question_fields)
    @api.expect(submit_question_fields) #espera el serializador submit_question_fields
    @api.response(200, "Success")
    @api.response(400, "Missing parameters", generic_error)
    def post(self):
        """
        Creates a question
        """
        #Conexion con BD (ya sea si es un motor o una en memoria, estilo redis)
        #Que el "modelo" de los campos recibidos del Front, sea igual a lo esperado por la API (submit_question_fields)
        #Validar cada campo, tipo de dato, longitud
        #Contemplar la concurrencia, transacciones abiertas, y que no se pisen datos. (Consistencia)
        #Si no se puede guardar en la BD, que se muestre porque en el Front(msj de error), y hacer rollback de la transaccion 
        #Que no se pierdan datos enviados a la API, y devolverlos al Front para que modifique lo que sea necesario, en caso de que estos no hallan pasado las validacions

        question = api.payload #payload es el Body de la request (donde va el json)


        return None, 200


@questions_ns.param('question_id', 'The question ID') 
@questions_ns.route('/<string:question_id>')  #aca indico que recibe un ID la url 
@questions_ns.response(404, "Question not found", generic_error) #por defecto asumimos que esta mal
@api.doc(params={'question_id': 'Question ID'})
class QuestionResource(Resource):

    @jwt_required
    @questions_ns.doc('get_question', expect=[auth_parser])
    @questions_ns.marshal_with(question_fields, code=200, description="Returns the question") #marshea(matchea) con el modelo establecido en question_fields
    @questions_ns.response(401, "Access denied", generic_error)
    def get(self, question_id):
        """
        Returns the question

        :raises Unauthorized: When current user has insufficient permissions
        """

        #Conexion con BD (ya sea si es un motor o una en memoria, estilo redis)
        #Verificar que formato de ID sea correcto (el de la question en particular que quiero obtener)
        #Que el usuario que lo solicita esta request, tenga los permisos necesario, en caso de que no, mostrar correspondiente de error
        #Hacer el get efectivamente 
        #Basicamente, son los mismos puntos que el GET de TODAS las questions

        return None

    @jwt_required
    @questions_ns.doc('remove_question', expect=[auth_parser])
    @questions_ns.response(401, "Access denied", generic_error)
    def delete(self, question_id=None):
        """
        Deletes a question

        :raises Unauthorized: When current user has insufficient permissions
        :raises BadRequest: When couldn't delete the question
        """

        #Los mismos aspectos a tener en cuenta que en POST de una Question, hay que tenerlos en esta instancia, al momento de borar una Question. 
        
        try:
            return '', 200
        except:
            raise BadRequest("There was a problem deleting the question")



def run():
    DEBUG = os.environ.get('DEBUG', False)
    BIND = os.environ.get('GUNICORN_BIND', '127.0.0.1:8000')
    (HOST, PORT, *_) = BIND.split(':')

    app.run(debug=DEBUG, host=HOST, port=PORT)


if __name__ == '__main__':
    run()
