import sharp from "sharp";
import { S3 } from "aws-sdk";
import { Request } from "express";
import { StorageEngine } from "multer";
import { ManagedUpload } from "aws-sdk/clients/s3";

class SharpS3StorageEngine implements StorageEngine {
    opts: MulterS3Options;

    constructor(options: MulterS3Options) {
        this.opts = options;
    }

    public _handleFile(
        req: Request,
        file: Express.MulterS3.File,
        cb: (error?: Error, info?: Partial<Express.Multer.File>) => void
    ): void {
        const { opts } = this;
        const { mimetype, stream } = file;
        const params: S3.Types.PutObjectRequest = {
            Bucket: opts.Bucket,
            ACL: opts.ACL,
            Body: stream,
            Key: opts.Key,
        };

        if (typeof opts.Key === "function") {
            opts.Key(req, file, (fileErr: Error, Key: string) => {
                if (fileErr) {
                    cb(fileErr);
                    return;
                }
                params.Key = Key;

                if (mimetype.startsWith("image") && !mimetype.endsWith("gif")) {
                    this._uploadProcess(params, file, cb);
                } else {
                    this._uploadNonImage(params, file, cb);
                }
            });
        } else {
            if (mimetype.startsWith("image") && !mimetype.endsWith("gif")) {
                this._uploadProcess(params, file, cb);
            } else {
                this._uploadNonImage(params, file, cb);
            }
        }
    }

    public _removeFile(req: Request, file: Express.MulterS3.File, cb: (error: Error | null) => void): void {
        this.opts.s3.deleteObject({ Bucket: file.bucket, Key: file.key }, cb);
    }

    private async _uploadProcess(
        params: S3.PutObjectRequest,
        file: Express.MulterS3.File,
        cb: (error?: Error, info?: Partial<Express.Multer.File>) => void
    ) {
        const buff = await streamToBuffer(file.stream);

        const compressedFile = await sharp(buff).jpeg({ quality: 70 }).toBuffer();
        params.Body = compressedFile;

        this.opts.s3.upload(params, (err: Error, data: ManagedUpload.SendData) => {
            if (err) {
                cb(err, undefined);
            } else {
                cb(undefined, { filename: data.Key, destination: data.Location, mimetype: "image/jpeg" });
            }
        });
    }

    private _uploadNonImage(
        params: S3.Types.PutObjectRequest,
        file: Express.MulterS3.File,
        cb: (error?: Error, info?: Partial<Express.Multer.File>) => void
    ) {
        this.opts.s3.upload(params, (err: Error, data: ManagedUpload.SendData) => {
            if (err) {
                cb(err, undefined);
            } else {
                cb(undefined, { filename: data.Key, destination: data.Location });
            }
        });
    }
}

interface MulterS3Options extends S3.Types.PutObjectRequest {
    s3: S3;
    Key: any;
}

function sharpS3Storage(options: MulterS3Options): SharpS3StorageEngine {
    return new SharpS3StorageEngine(options);
}

const streamToBuffer = (stream): Promise<Buffer> => {
    const chunks: any[] = [];
    return new Promise((resolve, reject) => {
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
};

export default sharpS3Storage;
