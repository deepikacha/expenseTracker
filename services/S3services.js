// const AWS=require('aws-sdk');
// const uploadToS3=(data,filename)=>{
//     const BUCKET_NAME=process.env.BUCKETNAME;
//     const IAM_USER_KEY=process.env.ACCESSKEY;
//     const IAM_USER_SECRET=process.env.SECRETACCESSKEY
//      let s3bucket=new AWS.S3({
//       accessKeyId:IAM_USER_KEY,
//       secretAccesskey:IAM_USER_SECRET,  
//       // Bucket:BUCKET_NAME
//      })
//   console.log(BUCKET_NAME)
//   console.log(IAM_USER_KEY)
//   console.log(IAM_USER_SECRET)
     
//       var params={
//         Bucket:BUCKET_NAME,
//         Key:filename,
//         Body:data,
//         ACL:'public-read'
  
//       }
//       return new Promise((resolve,reject)=>{
//         s3bucket.upload(params,(err,s3response)=>{
//           if(err){
//             console.log("something went wrong",err);
//             reject(err)
//           }
//           else{
//             console.log("success",s3response);
//             resolve(s3response.Location);
//           }
//         })
//       })
     
     
  
//   }

//   module.exports={
//     uploadToS3
//   }


const AWS = require('aws-sdk');

class AWSService {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadToS3(bucketName, key, data) {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: data,
      ACL: "public-read",
      ContentType: "text/csv"
    };

    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}

module.exports = new AWSService();