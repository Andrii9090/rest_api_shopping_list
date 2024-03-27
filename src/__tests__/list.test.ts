import supertest from "supertest";
import app from "../app";
import User from "../database/models/user.model";
import initDb, { clearDb } from "../database/db";
import { token, token2 } from './config.json'
import UserAccessCode from "../database/models/userAccessCode.model";


const listModelObj = {
    id: expect.any(Number),
    title: expect.any(String),
    creator_id: expect.any(Number),
    is_active: expect.any(Boolean),
    is_delete: expect.any(Boolean),
    createdAt: expect.any(String),
    updatedAt: expect.any(String)
}

let code = 44632

beforeAll(async () => {
    await initDb()
    await User.create({
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        password: 'password',
        email: 'test@example.com'
    })
    await User.create({
        first_name: 'Ivan',
        last_name: 'Doe',
        is_active: true,
        password: 'password',
        email: 'test2@example.com'
    })    

    await UserAccessCode.create({
        code: code,
        user_id: 2,
        expire_date: (new Date().getTime() + 10 * 60 * 1000 + 10000).toString(),
    })

})


afterAll(async () => {
    await clearDb()
})


describe('TEST API /list', () => {

    it('create list /list/', async () => {
        return supertest(app)
            .post('/api/list')
            .send({
                title: 'List'
            })
            .auth(token, { type: 'bearer' })
            .expect(200)
            .expect((res) => {
                expect(res.body.isError).toBe(false)
            })
    })

    it('create list /list/', async () => {
        return supertest(app)
            .post('/api/list')
            .send({
                title: 'List3'
            })
            .auth(token, { type: 'bearer' })
            .expect(200)
            .expect((res) => {
                expect(res.body.isError).toBe(false)
            })
    })

    it('create list /list/', async () => {
        return supertest(app)
            .post('/api/list')
            .send({
                title: 'NO LIST MANY'
            })
            .auth('1234ggg', { type: 'bearer' })
            .expect(401)
            .expect((res) => {
                expect(res.body.isError).toBe(true)
            })
    })

    it('create list /list/', async () => {
        return supertest(app)
            .post('/api/list')
            .send({
                title: 'NO LIST MANY 22'
            })
            .auth('1234ggg', { type: 'bearer' })
            .expect(401)
            .expect((res) => {
                expect(res.body.isError).toBe(true)
            })
    })

    it('Create list with invalid data /list/', async () => {
        return supertest(app)
            .post('/api/list')
            .send({
                trumpa: 'dsfgdb'
            })
            .auth(token, { type: 'bearer' })
            .expect(400)
    })

    it('Get All lists /list/', async () => {
        return supertest(app)
            .get('/api/list')
            .auth(token, { type: 'bearer' })
            .expect(200)
            .expect((res) => {
                expect(res.body.isError).toBe(false)
                expect(res.body.data.length).toBe(2)
                expect(res.body.data[0]).toMatchObject(listModelObj)
            })
    })

    // it('Get All lists /list/. Error no hay permission, http erro 400', async () => {
    //     return supertest(app)
    //         .get('/api/list')
    //         .auth('1234ggg', { type: 'bearer' })
    //         .expect(400)
    //         .expect((res) => {
    //             expect(res.body.isError).toBe(true)
    //         })
    // })


    it('Update list /list/:id', async () => {
        return supertest(app)
            .post('/api/list/1')
            .auth(token, { type: 'bearer' })
            .send({
                title: 'Updated List',
                is_active: false
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.isError).toBe(false)
                expect(res.body.data.is_active).toBe(false)
                expect(res.body.data.title).toBe('Updated List')
            })
    })

    it('Delete list /list/:id', async () => {
        return supertest(app)
            .delete('/api/list/1')
            .auth(token, { type: 'bearer' })
            .expect(200)
            .expect((res) => {
                expect(res.body.isError).toBe(false)
            })
    })

    it('Delete list 400 Erorr', async () => {
        return supertest(app)
            .delete('/api/list/11')
            .auth(token, { type: 'bearer' })
            .expect(400)
            .expect((res) => {
                expect(res.body.isError).toBe(true)
            })
    })

    it('Add user to list /list/:id/add-user RES FAIL', async () => {
        return supertest(app)
            .post('/api/list/1/add-user')
            .auth(token, { type: 'bearer' })
            .send({
                code: '000000000000'
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.isError).toBe(true)
            })
    })


    it('Add user to list /list/:id/add-user RES OK', async () => {
        return supertest(app)
            .post('/api/list/1/add-user')
            .auth(token, { type: 'bearer' })
            .send({
                code
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.isError).toBe(false)
            })
    })


})