import supertest from "supertest";
import app from "../app";
import User from "../database/models/user.model";
import initDb, { clearDb } from "../database/db";
import {token, token2} from './config.json'

import logger from "../logger";


beforeAll(async () => {
    await initDb()
    await User.create({
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        password: 'password',
        token: token,
        email: 'test@example.com'
    })
})


afterAll(async () => {
    await clearDb()
})

describe('TEST API /user', () => {

    it('create user /user/ RESULT OK', async () => {
        return supertest(app)
            .post('/api/user/create')
            .send({
                email: 'test2@example.com',
                password: 'password'
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.data.token).not.toBeUndefined()
                expect(res.body.isError).toBe(false)
            })
    })

    it('create user /user/ RESULT FAIL', async () => {
        return supertest(app)
            .post('/api/user/create')
            .send({
                password: 'password'
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.isError).toBe(true)
            })
    })

    it('test access code /user/access-code', async () => {
        return supertest(app)
        .get('/api/user/access-code')
        .expect(200)
        .auth(token, { type: 'bearer' })
        .expect((res) => {
            expect(res.body.isError).toBe(false)
            expect(res.body.data).not.toBeUndefined()
        })
    })
})