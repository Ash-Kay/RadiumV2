import { UserController } from "./controller/UserController";

export const Routes = [
    {
        method: "get",
        route: "/users",
        controller: UserController,
        validationSchema: "none",
        action: "all"
    },
    {
        method: "get",
        route: "/users/:id",
        controller: UserController,
        validationSchema: "none",
        action: "one"
    },
    {
        method: "post",
        route: "/users",
        controller: UserController,
        validationSchema: "userRegister",
        action: "save"
    },
    {
        method: "delete",
        route: "/users/:id",
        controller: UserController,
        validationSchema: "none",
        action: "remove"
    }
];
