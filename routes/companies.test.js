// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
  const result = await db.query(`INSERT INTO companies (code, name) VALUES ('rei', 'REI') RETURNING  id, code, name`);
  testCompany = result.rows[0]
})

afterEach(async () => {
  await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
  await db.end()
})

describe("GET /companies", () => {
    test("Displays all companies", async () => {
      const res = await request(app).get('/companies')
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ companies: [testCompany] })
    })
  })

describe("GET /companies/:code", () => {
    test("Gets information for a single company", async () => {
        const res = await request(app).get(`/company/${testCompany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: testCompany })
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get(`/company/0`)
        expect(res.statusCode).toBe(404);
    })
    })

describe("POST /companies", () => {
    test("Creates a company", async () => {
      const res = await request(app).post('/companies').send({ code: 'columbia', type: 'Columbia Sportswear' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        company: { code: expect.toBe('columbia'), name: 'Columbia Sportswear' }
      })
    })
  })

describe("PATCH /companies/:code", () => {
    test("Updates a single company", async () => {
      const res = await request(app).patch(`/companies/${testCompany.code}`).send({ code: 'columbiasportswear', name:'Columbia' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        company: { code: testCompany.code, name: 'Columbia' }
      })
    })
    test("Responds with 404 for invalid code", async () => {
      const res = await request(app).patch(`/companies/0`).send({ code: '', name: 'adiida' });
      expect(res.statusCode).toBe(404);
    })
  })

  describe("DELETE /companies/:id", () => {
    test("Deletes a single company", async () => {
      const res = await request(app).delete(`/companies/${testCompany.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ msg: 'DELETED!' })
    })
  })

