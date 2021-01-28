import _ from "lodash";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

//Entities
import { Post } from "../entity/post.entity";
import { Comment } from "../entity/comment.entity";
import { DeepPartial } from "typeorm";
import { UserToken } from "../interface/model.interface";
import { CreatePostBody } from "../validator/schema";

// Config
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo();

export const mapCreatePostResponseToEntity = (
    body: CreatePostBody,
    ruser: UserToken,
    file: Express.Multer.File
): DeepPartial<Post> => {
    return {
        title: body.title,
        sensitive: body.sensitive,
        mediaUrl: file.destination,
        mime: file.mimetype,
        user: {
            id: ruser.id,
        },
    };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const mapGetFeedSqlToResponse = (rawPosts) => {
    return _.chain(rawPosts)
        .map((e) =>
            _.assign(e, {
                timeago: timeAgo.format(new Date(e.createdAt).getTime(), "twitter"),
                user: { id: e.userId, username: e.username, avatarUrl: e.avatarUrl },
                sensitive: Boolean(+e.sensitive),
                voteSum: +e.voteSum,
            })
        )
        .map((e) => _.omit(e, ["userId", "username", "avatarUrl"]))
        .value();
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const mapGetFeedWithVoteSqlToResponse = (rawPosts) => {
    return _.chain(rawPosts)
        .map((e) =>
            _.assign(e, {
                timeago: timeAgo.format(new Date(e.createdAt).getTime(), "twitter"),
                user: { id: e.userId, username: e.username, avatarUrl: e.avatarUrl },
                sensitive: Boolean(+e.sensitive),
                vote: +e.vote,
                voteSum: +e.voteSum,
            })
        )
        .map((e) => _.omit(e, ["userId", "username", "avatarUrl"]))
        .value();
};

export const mapGetPostCommentSqlToResponse = (rawComms): Comment[] => {
    return _.map(rawComms, (e) =>
        _.assign(e, {
            timeago: timeAgo.format(new Date(e.createdAt).getTime(), "twitter"),
        })
    );
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const mapGetPostCommentWithVoteSqlToResponse = (rawComms) => {
    return _.chain(rawComms)
        .map((e) =>
            _.assign(e, {
                timeago: timeAgo.format(new Date(e.createdAt).getTime(), "twitter"),
                user: { id: e.userId, username: e.username, avatarUrl: e.avatarUrl },
                vote: +e.vote,
                voteSum: +e.voteSum,
            })
        )
        .map((e) => _.omit(e, ["userId", "username", "avatarUrl"]))
        .value();
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const mapGetOneWithVotePostSqlToResponse = (rawPost) => {
    return _.chain(rawPost)
        .map((e) =>
            _.assign(e, {
                timeago: timeAgo.format(new Date(e.createdAt).getTime(), "twitter"),
                user: { id: e.userId, username: e.username, avatarUrl: e.avatarUrl },
                sensitive: Boolean(+e.sensitive),
                vote: +e.vote,
                voteSum: +e.voteSum,
            })
        )
        .map((e) => _.omit(e, ["userId", "username", "avatarUrl"]))
        .value()[0];
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const mapGetOnePostSqlToResponse = (rawPost) => {
    return _.chain(rawPost)
        .map((e) =>
            _.assign(e, {
                timeago: timeAgo.format(new Date(e.createdAt).getTime(), "twitter"),
                user: { id: e.userId, username: e.username, avatarUrl: e.avatarUrl },
                sensitive: Boolean(+e.sensitive),
                voteSum: +e.voteSum,
            })
        )
        .map((e) => _.omit(e, ["userId", "username", "avatarUrl"]))
        .value()[0];
};
