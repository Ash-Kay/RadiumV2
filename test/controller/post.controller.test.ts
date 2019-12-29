import { expect } from "chai";
import * as supertest from "supertest";

import app from "../../src/index";

describe("TEST /users", function() {
    it("Fetch ONE post", () => {
        return supertest(app)
            .get("/api/v1/posts/1")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then(res => {
                const body = res.body;
                expect(body).to.have.property("id");
                expect(body).to.have.property("title");
                expect(body).to.have.property("file_path");
                expect(body).to.have.property("user_id");
            });
    });
});
