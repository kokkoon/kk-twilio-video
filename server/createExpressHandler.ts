import 'dotenv/config';
import { Request, Response } from 'express';
import { ServerlessContext, ServerlessFunction } from './types';
import Twilio from 'twilio';
import fs from 'fs';
import path from 'path';


const {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
  TWILIO_CONVERSATIONS_SERVICE_SID,
  REACT_APP_TWILIO_ENVIRONMENT,
} = process.env;

const twilioClient = Twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
  region: REACT_APP_TWILIO_ENVIRONMENT === 'prod' ? undefined : REACT_APP_TWILIO_ENVIRONMENT,
});

const context: ServerlessContext = {
  ACCOUNT_SID: TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
  ROOM_TYPE: 'group',
  CONVERSATIONS_SERVICE_SID: TWILIO_CONVERSATIONS_SERVICE_SID,
  getTwilioClient: () => twilioClient,
};

export function createExpressHandler(serverlessFunction: ServerlessFunction) {
  return (req: Request, res: Response) => {
    serverlessFunction(context, req.body, async (_, serverlessResponse) => {
      const { statusCode, headers, body } = serverlessResponse;
      let room_data: any = await getRoomData()
      console.log(room_data);
      if (room_data && room_data.length == 0) {
        const payload = {
          room_name: req.body.room_name,
          presenter_user: req.body.user_identity,
          user_lists: [{ name: req.body.user_identity }]
        }
        await addRoomData([payload])
      } else if (room_data && room_data.length >= 0) {
        let findRoom = room_data.findIndex((x: any) => x.room_name == req.body.room_name);
        if (findRoom >= 0) {
          let findUser = room_data[findRoom].user_lists.findIndex((x: any) => x.name == req.body.user_identity);
          if (findUser < 0) {
            room_data[findRoom].user_lists.push({ name: req.body.user_identity });
          }
        } else {
            const payload = {
              room_name: req.body.room_name,
              presenter_user: req.body.user_identity,
              user_lists: [{ name: req.body.user_identity }]
            }
            room_data.push(payload)
        }

        await addRoomData(JSON.parse(JSON.stringify(room_data)))
      }

      body["room_data"] = room_data.find((x: any) => x.room_name == req.body.room_name)
      res
        .status(statusCode)
        .set(headers)
        .json(body);
    });
  };
}

const getRoomData = async () => {
  // new Promise((resolve, rejects) => {
  let result = fs.readFileSync(path.join(__dirname, "user_room.json"), 'utf8')
  if (result) {
    return JSON.parse(result)
  } else {
    return [];
  }

}

const addRoomData = async (result: any) => {
  new Promise((resolve, rejects) => {
    fs.writeFile(path.join(__dirname, "user_room.json"), JSON.stringify(result), 'utf8', err => {
      resolve(true);
    });
  })
}
