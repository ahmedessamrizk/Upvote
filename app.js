import dotenv from 'dotenv'
dotenv.config({ path: './config/.env' })
import express from 'express'
import { connectDB } from './DB/connection.js'
import * as indexRouter from './src/modules/index.router.js'
import schedule from 'node-schedule'
import { dailyMessage } from './src/modules/user/controller/user.js'


const app = express()
const port = 3000
const baseURL = process.env.BASEURL
app.use(express.json());

app.use(`${baseURL}/auth`,indexRouter.authRouter);
app.use(`${baseURL}/user`,indexRouter.userRouter);
app.use(`${baseURL}/post`,indexRouter.postRouter);


const job = schedule.scheduleJob('* * * 1 * *', function(){
    dailyMessage();
  });

connectDB();
app.listen(port, () => console.log(`Server is running on port ${port}!`));