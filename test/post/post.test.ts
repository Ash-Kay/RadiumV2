import supertest from "supertest";
import app from "../../src/index";
import { config } from "dotenv";
import { expect, assert } from "chai";
config();

let postid;
let commid;

describe("TEST /users", () => {
    before("Create Post", () => {
        return supertest(app)
            .post("/api/v1/posts/")
            .set({
                Authorization: "Bearer " + process.env.JWT_TEST,
            })
            .field("title", "TEST_POST")
            .attach("file", "test/file/img.jpg")
            .expect(201)
            .then((res) => {
                postid = res.body.data.id;
                assert.isNumber(postid);
            });
    });

    it("Fetch ONE post", () => {
        return supertest(app)
            .get("/api/v1/posts/1")
            .expect(200)
            .then((res) => {
                const body = res.body;
                expect(body).to.have.property("success");
                expect(body.success).to.be.true;
                expect(body).to.have.property("message");
                expect(body).to.have.property("data");

                expect(body.data).to.have.property("id");
                expect(body.data).to.have.property("title");
                expect(body.data).to.have.property("mediaUrl");
                expect(body.data).to.have.property("sensitive");
                expect(body.data).to.have.property("createdAt");
                expect(body.data).to.have.property("updatedAt");
                expect(body.data).to.have.property("deletedAt");
                expect(body.data).to.have.property("mime");
                expect(body.data).to.have.property("voteSum");
                expect(body.data).to.have.property("timeago");
                expect(body.data).to.have.property("user");

                expect(body.data.user).to.have.property("id");
                expect(body.data.user).to.have.property("username");
                expect(body.data.user).to.have.property("avatarUrl");
            });
    });

    it("Fetch ONE post with AUTH", () => {
        return supertest(app)
            .get("/api/v1/posts/1")
            .set({
                Authorization: "Bearer " + process.env.JWT_TEST,
            })
            .expect(200)
            .then((res) => {
                const body = res.body;
                expect(body).to.have.property("success");
                expect(body.success).to.be.true;
                expect(body).to.have.property("message");
                expect(body).to.have.property("data");

                expect(body.data).to.have.property("id");
                expect(body.data).to.have.property("title");
                expect(body.data).to.have.property("mediaUrl");
                expect(body.data).to.have.property("sensitive");
                expect(body.data).to.have.property("createdAt");
                expect(body.data).to.have.property("updatedAt");
                expect(body.data).to.have.property("deletedAt");
                expect(body.data).to.have.property("mime");
                expect(body.data).to.have.property("vote");
                expect(body.data).to.have.property("voteSum");
                expect(body.data).to.have.property("timeago");
                expect(body.data).to.have.property("user");

                expect(body.data.user).to.have.property("id");
                expect(body.data.user).to.have.property("username");
                expect(body.data.user).to.have.property("avatarUrl");
            });
    });

    it("Generate feed", () => {
        return supertest(app)
            .get("/api/v1/posts/?page=1")
            .expect(200)
            .then((res) => {
                const body = res.body;
                expect(body).to.have.property("success");
                expect(body.success).to.be.true;
                expect(body).to.have.property("message");
                expect(body).to.have.property("previousPage");
                expect(body).to.have.property("nextPage");
                expect(body).to.have.property("data");

                expect(body.data).to.be.an("array");
                expect(body.data[0]).to.have.property("id");
                expect(body.data[0]).to.have.property("title");
                expect(body.data[0]).to.have.property("mediaUrl");
                expect(body.data[0]).to.have.property("sensitive");
                expect(body.data[0]).to.have.property("createdAt");
                expect(body.data[0]).to.have.property("updatedAt");
                expect(body.data[0]).to.have.property("deletedAt");
                expect(body.data[0]).to.have.property("mime");
                expect(body.data[0]).to.have.property("voteSum");
                expect(body.data[0]).to.have.property("timeago");
                expect(body.data[0]).to.have.property("user");

                expect(body.data[0].user).to.have.property("id");
                expect(body.data[0].user).to.have.property("username");
                expect(body.data[0].user).to.have.property("avatarUrl");
            });
    });

    it("Generate feed with AUTH", () => {
        return supertest(app)
            .get("/api/v1/posts/?page=1")
            .set({
                Authorization: "Bearer " + process.env.JWT_TEST,
            })
            .expect(200)
            .then((res) => {
                const body = res.body;
                expect(body).to.have.property("success");
                expect(body.success).to.be.true;
                expect(body).to.have.property("message");
                expect(body).to.have.property("previousPage");
                expect(body).to.have.property("nextPage");
                expect(body).to.have.property("data");

                expect(body.data).to.be.an("array");
                expect(body.data[0]).to.have.property("id");
                expect(body.data[0]).to.have.property("title");
                expect(body.data[0]).to.have.property("mediaUrl");
                expect(body.data[0]).to.have.property("sensitive");
                expect(body.data[0]).to.have.property("createdAt");
                expect(body.data[0]).to.have.property("updatedAt");
                expect(body.data[0]).to.have.property("deletedAt");
                expect(body.data[0]).to.have.property("mime");
                expect(body.data[0]).to.have.property("vote");
                expect(body.data[0]).to.have.property("voteSum");
                expect(body.data[0]).to.have.property("timeago");
                expect(body.data[0]).to.have.property("user");

                expect(body.data[0].user).to.have.property("id");
                expect(body.data[0].user).to.have.property("username");
                expect(body.data[0].user).to.have.property("avatarUrl");
            });
    });

    it("Create Post with no AUTH", () => {
        return supertest(app)
            .post("/api/v1/posts/")
            .field("title", "TEST_POST")
            .attach("file", "test/file/img.jpg")
            .expect(401);
    });

    describe("TEST user UPVOTE/DOWNVOTE", () => {
        it("UPVOTE Post", () => {
            return supertest(app)
                .post(`/api/v1/posts/${postid}/upvote/`)
                .set({
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202)
                .then((res) => {
                    const body = res.body;
                    expect(body).to.have.property("success");
                    expect(body.success).to.be.true;
                    expect(body).to.have.property("message");
                    expect(body).to.have.property("data");

                    expect(body.data).to.have.property("user");
                    expect(body.data.user).to.have.property("id");
                    expect(body.data).to.have.property("post");
                    expect(body.data.post).to.have.property("id");

                    expect(body.data).to.have.property("vote");
                    expect(body.data.vote).to.equal(1);

                    expect(body.data).to.have.property("createdAt");
                    expect(body.data).to.have.property("updatedAt");
                    expect(body.data).to.have.property("deletedAt");
                });
        });

        it("DOWNVOTE Post", () => {
            return supertest(app)
                .post(`/api/v1/posts/${postid}/downvote/`)
                .set({
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202)
                .then((res) => {
                    const body = res.body;
                    expect(body).to.have.property("success");
                    expect(body.success).to.be.true;
                    expect(body).to.have.property("message");
                    expect(body).to.have.property("data");

                    expect(body.data).to.have.property("user");
                    expect(body.data.user).to.have.property("id");
                    expect(body.data).to.have.property("post");
                    expect(body.data.post).to.have.property("id");

                    expect(body.data).to.have.property("vote");
                    expect(body.data.vote).to.equal(-1);

                    expect(body.data).to.have.property("createdAt");
                    expect(body.data).to.have.property("updatedAt");
                    expect(body.data).to.have.property("deletedAt");
                });
        });

        it("Remove vote", () => {
            return supertest(app)
                .delete(`/api/v1/posts/${postid}/removevote/`)
                .set({
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202)
                .then((res) => {
                    const body = res.body;
                    expect(body).to.have.property("success");
                    expect(body.success).to.be.true;
                    expect(body).to.have.property("message");
                    expect(body).to.have.property("data");
                });
        });
    });

    describe("TEST user Comment", () => {
        it("Comment on post with MEDIA", () => {
            return supertest(app)
                .post(`/api/v1/posts/${postid}/comment/`)
                .field("message", "TEST_POST_COMMENT")
                .attach("file", "test/file/img.jpg")
                .set({
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(201)
                .then((res) => {
                    const body = res.body;
                    expect(body).to.have.property("success");
                    expect(body.success).to.be.true;
                    expect(body).to.have.property("message");
                    expect(body).to.have.property("data");

                    expect(body.data).to.have.property("id");
                    expect(body.data).to.have.property("message");
                    expect(body.data).to.have.property("mediaUrl");
                    expect(body.data.mediaUrl).to.be.a("string");
                    expect(body.data).to.have.property("mime");
                    expect(body.data).to.have.property("tagTo");
                    expect(body.data).to.have.property("user");
                    expect(body.data.user).to.have.property("id");
                    expect(body.data).to.have.property("post");
                    expect(body.data.post).to.have.property("id");

                    //TODO CHECK THIS
                    // expect(body.data).to.have.property("createdAt");
                    expect(body.data).to.have.property("updatedAt");
                    expect(body.data).to.have.property("deletedAt");

                    commid = body.data.id;
                });
        });

        it("Get ONE comment", () => {
            return supertest(app)
                .get(`/api/v1/comments/${commid}`)
                .expect(200)
                .then((res) => {
                    const body = res.body;
                    expect(body).to.have.property("success");
                    expect(body.success).to.be.true;
                    expect(body).to.have.property("message");
                    expect(body).to.have.property("data");

                    expect(body.data).to.have.property("id");
                    expect(body.data).to.have.property("message");
                    expect(body.data).to.have.property("mediaUrl");
                    expect(body.data).to.have.property("mime");
                    //TODO tagto?

                    expect(body.data).to.have.property("createdAt");
                    expect(body.data).to.have.property("updatedAt");
                    expect(body.data).to.have.property("deletedAt");
                });
        });

        it("Delete comment", () => {
            return supertest(app)
                .delete(`/api/v1/comments/${commid}`)
                .set({
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202)
                .then((res) => {
                    const body = res.body;
                    expect(body).to.have.property("success");
                    expect(body.success).to.be.true;
                    expect(body).to.have.property("message");
                    expect(body).to.have.property("data");
                });
        });

        it("Delete someone else comment", () => {
            return supertest(app)
                .delete(`/api/v1/comments/1`)
                .set({
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(404);
        });
    });

    describe("TEST user vote on comment", () => {
        it("UPVOTE Comment", () => {
            return supertest(app)
                .post(`/api/v1/comments/${commid}/upvote/`)
                .set({
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202)
                .then((res) => {
                    const body = res.body;
                    expect(body).to.have.property("success");
                    expect(body.success).to.be.true;
                    expect(body).to.have.property("message");
                    expect(body).to.have.property("data");

                    expect(body.data).to.have.property("user");
                    expect(body.data.user).to.have.property("id");
                    expect(body.data).to.have.property("comment");
                    expect(body.data.comment).to.have.property("id");

                    expect(body.data).to.have.property("vote");
                    expect(body.data.vote).to.equal(1);

                    expect(body.data).to.have.property("createdAt");
                    expect(body.data).to.have.property("updatedAt");
                    expect(body.data).to.have.property("deletedAt");
                });
        });

        it("DOWNVOTE Comment", () => {
            return supertest(app)
                .post(`/api/v1/comments/${commid}/downvote/`)
                .set({
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202)
                .then((res) => {
                    const body = res.body;
                    expect(body).to.have.property("success");
                    expect(body.success).to.be.true;
                    expect(body).to.have.property("message");
                    expect(body).to.have.property("data");

                    expect(body.data).to.have.property("user");
                    expect(body.data.user).to.have.property("id");
                    expect(body.data).to.have.property("comment");
                    expect(body.data.comment).to.have.property("id");

                    expect(body.data).to.have.property("vote");
                    expect(body.data.vote).to.equal(-1);

                    expect(body.data).to.have.property("createdAt");
                    expect(body.data).to.have.property("updatedAt");
                    expect(body.data).to.have.property("deletedAt");
                });
        });

        it("Remove vote from comment", () => {
            return supertest(app)
                .delete(`/api/v1/comments/${commid}/removevote/`)
                .set({
                    Authorization: "Bearer " + process.env.JWT_TEST,
                })
                .expect(202)
                .then((res) => {
                    const body = res.body;
                    expect(body).to.have.property("success");
                    expect(body.success).to.be.true;
                    expect(body).to.have.property("message");
                    expect(body).to.have.property("data");
                });
        });
    });

    after("Delete Post", () => {
        return supertest(app)
            .delete("/api/v1/posts/" + postid)
            .set({
                Authorization: "Bearer " + process.env.JWT_TEST,
            })
            .expect(202);
    });
});
