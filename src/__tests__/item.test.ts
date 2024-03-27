import supertest from "supertest"
import initDb, { clearDb } from "../database/db"
import User from "../database/models/user.model"
import app from "../app"
import List from "../database/models/list.model"
import ListUser from "../database/models/listUser.model"
import { token, token2 } from './config.json'
import path from "path"

const filePath = path.resolve(process.cwd(), 'public', 'uploads', 'image.jpg')


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
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        password: 'password',
        email: 'test2@example.com'
    })

    await List.create({
        title: 'List',
        creator_id: 1,
        is_active: true,
        is_delete: false
    })

    await ListUser.create({
        user_id: 1,
        list_id: 1
    })
})

afterAll(async () => {
    await clearDb()
})

describe('TEST API /item', () => {

    it('create item /item/', () => {
        return supertest(app)
            .post('/api/item')
            .send({
                title: 'Item',
                list_id: 1
            })
            .auth(token, { type: 'bearer' })
            .expect(200)
            .expect((res) => {
                expect(res.body.isError).toBe(false)
            })
    })

    it('create item /item/ Error', () => {
        return supertest(app)
            .post('/api/item')
            .send({
                dsfdd: 'Item',
                list_id: 1
            })
            .auth(token, { type: 'bearer' })
            .expect(400)
            .expect((res) => {
                expect(res.body.isError).toBe(true)
            })
    })

    it('Get All items /item/', () => {
        return supertest(app)
            .get('/api/item/1')
            .auth(token, { type: 'bearer' })
            .expect(200)
            .expect((res) => {
                expect(res.body.isError).toBe(false)
                expect(res.body.data.length).toBe(1)
                expect(res.body.data[0].title).toBe('Item')
            })
    })
    it('Get All items /item/ NOT PERMISSIONS', () => {
        return supertest(app)
            .get('/api/item')
            .auth('dsfgdfhgjh', { type: 'bearer' })
            .expect(401)
            .expect((res) => {
                expect(res.body.isError).toBe(true)
            })
    })


})

describe('TEST API image', () => {
    it('Save image /item/image/:id', () => {
        return supertest(app)
            .post('/api/image/1')
            .set('Accept', 'application/json')
            .set('Content-Type', 'multipart/form-data')
            .attach('image', filePath)
            .auth(token, { type: 'bearer' })
            .expect(200)
            .expect((res) => {
                expect(res.body.isError).toBe(false)
                expect(res.body.data).not.toBeUndefined()
            })
    })

    it('Get image /item/image/:id', () => {
        return supertest(app)
            .get('/api/image/1')
            .auth(token, { type: 'bearer' })
            .expect((res) => {
                console.log(res);
            })
            .expect(200)
            .expect((res) => {
                expect(res.body).not.toBeUndefined()
            })
    })

    it('Get image /item/image/:id RESULT FAIL NOT PERMISSION', () => {
        return supertest(app)
            .get('/api/image/1')
            .auth('token', { type: 'bearer' })
            .expect(401)
            .expect((res) => {
                expect(res.body).not.toBeUndefined()
            })
    })
})