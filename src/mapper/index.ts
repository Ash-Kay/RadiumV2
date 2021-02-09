import _ from "lodash";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

//Entities
import { DeepPartial } from "typeorm";
import { Post } from "../entity/post.entity";
import { Comment } from "../entity/comment.entity";
import { CreateCommentBody, CreatePostBody } from "../validator/schema";
import {
    UserToken,
    PostWithVoteSum,
    PostWithUserVoteAndVoteSum,
    CommentWithUserVoteAndVoteSum,
} from "../interface/model.interface";

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

export const mapGetFeedSqlToResponse = (rawPosts: PostWithVoteSum[]): DeepPartial<Post[]> => {
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

export const mapGetFeedWithVoteSqlToResponse = (rawPosts: PostWithUserVoteAndVoteSum[]) => {
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

export const mapGetPostCommentSqlToResponse = (rawComms: Comment[]): Comment[] => {
    return _.map(rawComms, (e) =>
        _.assign(e, {
            timeago: timeAgo.format(new Date(e.createdAt).getTime(), "twitter"),
        })
    );
};

export const mapGetPostCommentWithVoteSqlToResponse = (rawComms: CommentWithUserVoteAndVoteSum[]) => {
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

export const mapGetOneWithVotePostSqlToResponse = (rawPost: PostWithUserVoteAndVoteSum[]) => {
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

export const mapGetOnePostSqlToResponse = (rawPost: PostWithVoteSum[]) => {
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

export const mapCreatCommentResponseToEntity = (
    body: CreateCommentBody,
    postId: number,
    ruser: UserToken,
    file?: Express.Multer.File
): DeepPartial<Comment> => {
    return {
        message: body.message,
        mediaUrl: file?.destination,
        user: {
            id: ruser.id,
        },
        post: {
            id: postId,
        },
        tagTo: {
            id: body.tagTo,
        },
        mime: file?.mimetype,
    };
};
