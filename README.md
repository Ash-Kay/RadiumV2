Memenese

This is a **Backend API** of a social networking platform in Node.js

## Tech
Radium uses a number of open source projects to work:
* Chai , Mocha & Supertest - Testing & Assertion
* Knex.js - Knex.js is a SQL query builder.
* Joi - Schema description language and data validator
* dotenv - Loads environment variables from a .env file into process.env
* Winston - Used for logging in both console and log file for easy debugging
* Multer - For handling multipart form-data
* Express Async Errors - Handles async errors.
* Express Rate Limit - Limit repeated requests to public APIs and/or endpoints such as password reset
* Jsonwebtoken - for Authentication/ Authorization
* Express - fast node.js network app framework
* MySQL - for database
* TypeScript - Better error detection and autocompletion

## Features 
* CRUD posts, comments, users etc.
* Authentication, Authorization
* RateLimit to specific endpoints (or whole api)
* Validation of all input (Joi)
* Follow MC (of MVC)

## Snippets

Routes
```typescript
router.get("/", UserController.all);
router.post("/signup", validate(schema.userRegister), UserController.signup);
router.post("/login", validate(schema.userLogin), UserController.login);
router.get("/:id", UserController.one);
router.put("/update", verifyAuth, validate(schema.userUpdate), UserController.update);
router.get("/:id/posts", UserController.posts);

export default router;
```

SignUp
```typescript
export const signup = async (request: Request, response: Response, next: NextFunction) => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(request.body.password, salt);
    request.body.password = hashed;

    const user: User = await db("users").insert(request.body);
    logger.info(`${request.body.email} REGISTERED`, user);
    response.status(201).send(user);
};
```
Login
```typescript
export const login = async (request: Request, response: Response, next: NextFunction) => {
    const user: User = await db("users")
        .where({ email: request.body.email })
        .first();

    const isValid = await bcrypt.compare(request.body.password, user.password);
    if (isValid) {
        var token = jwt.sign(
            { email: user.email, id: user.id, type: user.user_type, username: user.username },
            process.env.JWT_KEY,
            {
                expiresIn: "7d"
            }
        );
    } else {
        logger.info(`AUTH FAILED: ${request.user.email}'s password does't match`);
        response.status(HttpStatusCode.BAD_REQUEST).end();
    }

    logger.info(`${request.body.email}' LOGGED in`);
    response.status(HttpStatusCode.OK).send(token);
};
```

Schema
```sql
CREATE TABLE `users` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(30) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(300) NOT NULL,
    `img_url` VARCHAR(100),
    `first_name` VARCHAR(100),
    `last_name` VARCHAR(100),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL,
    `last_ip` VARCHAR(100),
    `last_online` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `dob` DATE,
    `country` VARCHAR(30) NULL,
    `user_type` varchar(10) NOT NULL DEFAULT 'normal',
    PRIMARY KEY (`id`)
);
```

Test
```typescript
describe("TEST /users", () => {
    before("Create Post", done => {
        supertest(app)
            .post("/api/v1/posts/")
            .set({
                "Content-Type": "application/json",
                Authorization: "Bearer " + process.env.JWT_TEST
            })
            .field("title", "TEST_POST")
            .attach("file", "test/file/img.jpg")
            .expect(201)
            .then(res => {
                postid = res.body[0];
                assert.isNumber(postid);
                done();
            });
    });

    it("Fetch ONE post", () => {
        return supertest(app)
            .get("/api/v1/posts/1")
            .expect(200)
            .then(res => {
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
            .then(res => {
                const body = res.body;
                expect(body).to.be.an("array");
            });
    });

    //...

    after("Delete Post", done => {
        supertest(app)
            .delete("/api/v1/posts/" + postid)
            .set({
                "Content-Type": "application/json",
                Authorization: "Bearer " + process.env.JWT_TEST
            })
            .expect(200, done);
    });
});
```

