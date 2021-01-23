import { RecursivePartial } from "../interface/utilsTypes";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import _ from "lodash";

//Entities
import { Post } from "../entity/post.entity";
import { Comment } from "../entity/comment.entity";

// Config
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo();

export const mapCreatePostResponseToEntity = (body, ruser, fileName, meta, mime): RecursivePartial<Post> => {
    // console.log("file", file);
    return {
        title: body.title,
        sensitive: body.sensitive,
        mediaUrl: fileName,
        height: meta.height,
        width: meta.width,
        mime,
        user: {
            id: ruser.id,
        },
    };
};

export const mapCreateCommentResponseToEntity = (body, ruser, file, params): RecursivePartial<Comment> => {
    return {
        message: body.message,
        mediaUrl: file ? getMediaUrl(file) : undefined,
        user: {
            id: ruser.id,
        },
        post: {
            id: +params.id,
        },
        tagTo: {
            id: body.tagTo,
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

const getMediaUrl = (file): string => {
    if (process.env.NODE_ENV === "development") return file.key.replace(/\\/g, "/");
    else return file.path.replace(/\\/g, "/");
};
