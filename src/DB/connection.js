import mongoose from "mongoose";



export const DBconnection = async () => {
    return await mongoose.connect(process.env.DB_URI).then(
        console.log('DB connected successfully ✔️✔️')
    ).catch(err => console.error(`failed to connect to the database ❗❗ `, err))
    
}