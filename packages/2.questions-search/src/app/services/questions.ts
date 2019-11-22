import * as Faker from 'faker';
import { Question } from './question';

function fakeQuestion(id: number): Question {
    return {
        id,
        name: `${Faker.name.firstName()} ${Faker.name.lastName()}`,
        phone: Faker.phone.phoneNumber(),
        email: Faker.internet.email(),
        broker: Faker.helpers.randomize(brokers),
        message: Faker.lorem.paragraph()
    };
}

//brokes disponibles
export const brokers = [1, 2, 3, 40, 6];
//array de 100 datos fakes
export const questions: Array<Question> = [...Array(50).keys()].map(fakeQuestion);
