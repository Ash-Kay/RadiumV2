import supertest from "supertest";
import app from "../../src/index";
import { config } from "dotenv";
import { expect, assert } from "chai";
config();

let postid;
let commid;

describe("TEST /users", () => {
    before("Create Post", (done) => {
        supertest(app)
            .post("/api/v1/posts/")
            .set({
                "Content-Type": "application/json",
                Authorization: "Bearer " + process.env.JWT_TEST,
            })
            .field("title", "TEST_POST")
            .attach("file", "test/file/img.jpg")
            .expect(201)
            .then((res) => {
                postid = res.body[0];
                assert.isNumber(postid);
                done();
            });
    });

    it("Fetch ONE post", () => {
        return supertest(app)
            .get("/api/v1/posts/1")
            .expect(200)
            .then((res) => {
                const body = res.body;
                expect(body).to.have.property("id");
                expect(body).to.have.property("title");
                expect(body).to.have.property("file_path");
                expect(body).to.have.property("user_id");
            });
    });

    it("Generate feed", () => {
        return supertest(app)
            .get("/api/v1/posts/")
            .expect(200)
            .then((res) => {
                const body = res.body;
                expect(body).to.be.an("array");
            });
    });

    it("Create Post with no auth", (done) => {
        supertest(app)
            .post("/api/v1/posts/")
            .field("title", "TEST_POST")
            .attach("file", "test/file/img.jpg")
            .expect(401, done);
    });

    describe("TEST /users LIKE-UNLIKE", () => {
        it("Like Post", (done) => {
            supertest(app)
                .post(`/api/v1/posts/${postid}/like/`)
                .set({
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202, done);
        });

        it("UnLike Post", (done) => {
            supertest(app)
                .delete(`/api/v1/posts/${postid}/unlike/`)
                .set({
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202, done);
        });

        it("UnLike a post where i haven't liked", (done) => {
            supertest(app)
                .delete(`/api/v1/posts/1/unlike/`)
                .set({
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202, done);
        });
    });

    describe("TEST /users Comm-DeleteComm", () => {
        it("Comment on post", (done) => {
            supertest(app)
                .post(`/api/v1/posts/${postid}/comment/`)
                .field("message", "TEST_POST_COMMENT")
                .set({
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(201)
                .then((res) => {
                    commid = res.body[0];
                    assert.isNumber(commid);
                    done();
                });
        });

        it("Delete comment", (done) => {
            supertest(app)
                .delete(`/api/v1/comments/${commid}`)
                .set({
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202, done);
        });

        it("Delete someone else comment", (done) => {
            supertest(app)
                .delete(`/api/v1/comments/1`)
                .set({
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(404, done);
        });
    });

    after("Delete Post", (done) => {
        supertest(app)
            .delete("/api/v1/posts/" + postid)
            .set({
                "Content-Type": "application/json",
                Authorization: "Bearer " + process.env.JWT_TEST,
            })
            .expect(200, done);
    });
});
