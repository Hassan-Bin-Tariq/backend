import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import { google } from "googleapis"
import fs from "fs"

var FolderID;

const CLIENT_ID = '415909867180-3qsq9763f4fn19p6apd3jjpopfcgm8jl.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04M0ikiwU6OZUCgYIARAAGAQSNwF-L9IrIg2s124iUtx_OwI926BCPcntsjIHSVoJFGdHYBQdeVNR6LqdQHSaNnYCFtHyPpbd5Lg';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

///////////////////

//Removed all tests
//from tt
const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

mongoose.connect("mongodb+srv://hassan:hassan123@cluster0.brlttau.mongodb.net/Mediascape?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("DB connected")
})

const teacherSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const TeacherEmailsSchema = new mongoose.Schema({
    email: String,
})
const EBEmailsSchema = new mongoose.Schema({
    email: String,
    role: String,
})

const GBEmailsSchema = new mongoose.Schema({
    email: String,
})

const MentorrEmailsSchema = new mongoose.Schema({
    email: String,
})

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const MentorSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const EventSchema = new mongoose.Schema({
    teacherName: String,
    teacherEmail: String,
    teacherID: String,
    title: String,
    description: String,
    date: String,
    StartTime: String,
    EndTime: String,
    venue: String,
    status: String,
})

const EBSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const GBSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    slots: Object,
    Duty: Object,
})

const Student = new mongoose.model("Student", studentSchema)
const Teacher = new mongoose.model("Teacher", teacherSchema)
const Mentor = new mongoose.model("Mentor", MentorSchema)
const Event = new mongoose.model("Event", EventSchema)
const ExecutiveBody = new mongoose.model("ExecutiveBody", EBSchema)
const GeneralBody = new mongoose.model("GeneralBody", GBSchema)

const AllteacherEmails = new mongoose.model("AllteacherEmails", TeacherEmailsSchema)
const MentorEmail = new mongoose.model("MentorEmail", MentorrEmailsSchema)
const EBEmails = new mongoose.model("EBEmails", EBEmailsSchema)
const GBEmails = new mongoose.model("GBEmails", GBEmailsSchema)

//Routes

app.post("/login",async (req,res)=>{
    const { email, password} = req.body
    let Emailss;
    let Mentormail;
    let teachermails = [];
    let EBmails = [];
    let GBmails = [];

    try { //getting all emails of teachers from back end and changing them into single list to chek if teacher is loging in
        Emailss = await AllteacherEmails.find({});

        for (let i = 0; i < Emailss.length; i++) {
            teachermails.push(Emailss[i].email)
        }
        //console.log(teachermails);
    } catch (err) {
        throw err;
    }

    try { //Mentor ki email database ma se nikali to check if mentor is loging in
        Mentormail = await MentorEmail.find({});
        //console.log(Mentormail[0].email);
    } catch (err) {
        throw err;
    }

    try { //getting all emails of EBmembers from back end and changing them into single list to check if EB member is loging in
        Emailss = await EBEmails.find({});

        for (let i = 0; i < Emailss.length; i++) {
            EBmails.push(Emailss[i].email)
        }
        //console.log(EBmails);
    } catch (err) {
        throw err;
    }

    try { //getting all emails of GBmembers from back end and changing them into single list to check if GB member is loging in
        Emailss = await GBEmails.find({});

        for (let i = 0; i < Emailss.length; i++) {
            GBmails.push(Emailss[i].email)
        }
        //console.log(EBmails);
    } catch (err) {
        throw err;
    }

    
    if(teachermails.includes(email))
    {
        Teacher.findOne({ email: email}, (err, user) => {
            if(user){
                if(password === user.password ) {
                    res.send({message: "Teacher", user: user})
                } else {
                    res.send({ message: "Password didn't match"})
                }
            } else {
                res.send({message: "User not registered"})
            }
        })
    }
    else if(EBmails.includes(email))
    {
        const index = EBmails.findIndex(element => { //Getting the index of logged in eb member to get its role to route to that specific page
            if (element.email === email) {
                return true;
            }
            return false;
        });

        ExecutiveBody.findOne({ email: email}, (err, user) => {
            if(user){
                if(password === user.password ) {
                    res.send({message:"Photography Head", user: user})
                } else {
                    res.send({ message: "Password didn't match"})
                }
            } else {
                res.send({message: "User not registered"})
            }
        })
    }
    else if(GBmails.includes(email))
    {
        GeneralBody.findOne({ email: email}, (err, user) => {
            if(user){
                if(password === user.password ) {
                    res.send({message: "GeneralBody", user: user})
                } else {
                    res.send({ message: "Password didn't match"})
                }
            } else {
                res.send({message: "User not registered"})
            }
        })
    }
    else if(Mentormail[0].email == email)
    {
        Mentor.findOne({ email: email}, (err, user) => {
            if(user){
                if(password === user.password ) {
                    res.send({message: "Mentor", user: user})
                } else {
                    res.send({ message: "Password didn't match"})
                }
            } else {
                res.send({message: "Mentor not registered"})
            }
        })
    }
    else{
        Student.findOne({ email: email}, (err, user) => {
            if(user){
                if(password === user.password ) {
                    res.send({message: "Student", user: user})
                } else {
                    res.send({ message: "Password didn't match"})
                }
            } else {
                res.send({message: "User not registered"})
            }
        })
    }
})

app.post("/register",async (req,res)=>{
    let Emailss;
    let Mentormail;
    let teachermails = [];
    let EBmails = [];
    let GBmails = [];
    const { name, email, password, slots, Duty} = req.body

    try { //getting all emails of teachers from back end and changing them into single list to check if teacher is registring
        Emailss = await AllteacherEmails.find({});

        for (let i = 0; i < Emailss.length; i++) {
            teachermails.push(Emailss[i].email)
        }
        ///console.log(teachermails);
    } catch (err) {
        throw err;
    }

    try { //Mentor ki email database ma se nikali to checik if mentor is regsitring
        Mentormail = await MentorEmail.find({});
        //console.log(Mentormail[0].email);
    } catch (err) {
        throw err;
    }

    try { //getting all emails of EBmembers from back end and changing them into single list to check if EB member is registring
        Emailss = await EBEmails.find({});

        for (let i = 0; i < Emailss.length; i++) {
            EBmails.push(Emailss[i].email)
        }
        //console.log(EBmails);
    } catch (err) {
        throw err;
    }
GeneralBody
    try { //getting all emails of GBmembers from back end and changing them into single list to check if GB member is registring
        Emailss = await GBEmails.find({});

        for (let i = 0; i < Emailss.length; i++) {
            GBmails.push(Emailss[i].email)
        }
        //console.log(EBmails);
    } catch (err) {
        throw err;
    }

    Teacher.findOne({email: email}, (err, user) => {
        if(user){
            res.send({message: "User already registerd"})
        } 
        else {
            if(teachermails.includes(email))
            {
                const user = new Teacher({
                    name,
                    email,
                    password
                })
                user.save(err => {
                    if(err) {
                        res.send(err)
                    } else {
                        res.send( { message: "Successfully Teacher member Registered, Please login now." })
                    }
                })
            }
            else if(EBmails.includes(email))
            {
                const user = new ExecutiveBody({
                    name,
                    email,
                    password
                })
                user.save(err => {
                    if(err) {
                        res.send(err)
                    } else {
                        res.send( { message: "Successfully EB Registered, Please login now." })
                    }
                })
            }
            else if(GBmails.includes(email))
            {
                const user = new GeneralBody({
                    name,
                    email,
                    password,
                    slots,
                    Duty
                })
                user.save(err => {
                    if(err) {
                        res.send(err)
                    } else {
                        res.send( { message: "Successfully GB Registered, Please login now." })
                    }
                })
            }
            else if (email.includes("nu.edu.pk") && email != Mentormail[0].email){
                const user = new Student({
                    name,
                    email,
                    password
                })
                user.save(err => {
                    if(err) {
                        res.send(err)
                    } else {
                        res.send( { message: "Successfully Student Registered, Please login now." })
                    }
                })
            }
            else if(email == Mentormail[0].email)
            {
                const user = new Mentor({
                    name,
                    email,
                    password
                })
                user.save(err => {
                    if(err) {
                        res.send(err)
                    } else {
                        res.send( { message: "Successfully Mentor Registered, Please login now." })
                    }
                })
            }
            else{
                res.send( { message: "Register with nu ID allowed only" })
            }
        }
    })
})

app.post("/SendEventRequest",(req,res)=>{
    const {title,teacherName,teacherEmail,teacherID,description,date,StartTime,EndTime,venue,status} = req.body
    Event.findOne({title: title}, (err, event) => {
        if(event){
            res.send({message: "Event already requested"})
        } 
        else{
            const user = new Event({
                teacherName,
                teacherEmail,
                teacherID,
                title,
                description,
                date,
                StartTime,
                EndTime,
                venue,
                status,
            })
            user.save(err => {
                if(err) {
                    res.send(err)
                } else {
                    res.send( { message: "Successfully requested for event." })
                }
            })
        }
    })
})

app.post("/GetEventRequest",async (req,res)=>{
    
    try {
        const results = await Event.find({});
        res.send({message: "Got All Events", event: results})
    } catch (err) {
        throw err;
    }

})
app.post("/GetAcceptEvent",async(req,res)=>{
    try {
        const results = await Event.find({status: "Accepted"});
        res.send({message: "Got All Events", event: results})
    } catch (err) {
        throw err;
    }
})

app.post("/StatusAccept",async (req,res)=>{

    const {id} = req.body
    const query = { 
        _id:id,
        status: "Not Checked"
    };
    const update = { $set: { status: "Accepted"}};
    const options = {};
    await Event.updateOne(query, update, options);

    try {
        const results = await Event.find({});
        res.send({message: "Got All Events", event: results})
    } catch (err) {
        throw err;
    }
})

app.post("/StatusReject",async (req,res)=>{

    const {id} = req.body
    const query = { 
        _id:id,
        status: "Not Checked" 
    };
    const update = { $set: { status: "Rejected"}};
    const options = {};
    await Event.updateOne(query, update, options);
    
    try {
        const results = await Event.find({});
        res.send({message: "Got All Events", event: results})
    } catch (err) {
        throw err;
    }
})

app.post("/addslots",async (req,res)=>{

    const {zip,Email} = req.body
    //console.log(zip);
    const query = { 
        email:Email,
        slots: Array 
    };
    const update = { $set: { slots: zip}};
    const options = {};
    await GeneralBody.updateOne(query, update, options);
})

app.post("/GetFreeSlots",async (req,res)=>{

    const {zip,Email} = req.body
    console.log(Email);
    const query = { 
        email:Email
    };
    try {
        const results = await GeneralBody.find(query);
        //console.log(results);
        res.send({message: "Got your General Body", generalBodies: results})
    } catch (err) {
        throw err;
    }
})

app.post("/sendDuty",async (req,res)=>{

    const {dict,Email} = req.body
    console.log(dict);
    //console.log(Slot);
    console.log(Email);
    
    const query = { 
        email:Email,
    };
    const update = { 
    
    $set: {
        Duty: dict
    }};
    const options = {};
    await GeneralBody.updateOne(query, update, options);
})

app.post("/ChangePass",async (req,res)=>{

    const {Email,OldPassword,newPassword} = req.body
    console.log(Email);
    console.log(OldPassword);
    console.log(newPassword);

        const query = { 
            email:Email,
            password:OldPassword
        };
        const update = { 
        
        $set: {
            password: newPassword
        }};
        const options = {};
        await ExecutiveBody.updateOne(query, update, options);
})

app.post("/GetGBmembers",async(req,res)=>{
    try {
        const results = await GeneralBody.find({});
        //console.log(results);
        res.send({message: "Got All General Bodies", generalBodies: results})
    } catch (err) {
        throw err;
    }
})

async function createFolder(UserEmail){

    //console.log("inside folder maing")

    try {
        const response = await drive.files.create({
            
        requestBody: {
            'name': UserEmail,
            mimeType: 'application/vnd.google-apps.folder',
            'parents':  ['17McWc-DAfayH0BYiM7jmGbdLd-PXQNyH']
        },
        });
    
        console.log(response.data);
        FolderID = response.data.id
    } catch (error) {
        console.log(error.message);
    }

    // const driveService = google.drive({version: 'v3', auth});

    // let fileMetadata = {
    //     'name': UserEmail,
    //     mimeType: 'application/vnd.google-apps.folder',
    //     'parents':  ['15jMGzpWRGkYtV1mitmM6AcUhuB-xWS0J']
    // };
    // let response = await driveService.files.create({
    //     resource: fileMetadata,
    //     fields: 'id'
    // });

    // switch(response.status){
    //     case 200:
    //         let file = response.result;

    //         //INSERTING IMAGE INSIDE FOLDER WHICH IS JUST CREATED
    //         console.log('Created Folder Id: ', response.data.id);
    //         FolderID = response.data.id

    //         break;
    //     default:
    //         console.error('Error creating the file, ' + response.errors);
    //         break;
    // }
}

async function InsertImageInFolder(ImagePath){

    var n = ImagePath.lastIndexOf('/');
    var imageName = ImagePath.substring(n + 1);

    try {
        const response = await drive.files.create({
            
        requestBody: {
            name: imageName, //This can be name of your choice
            mimeType: 'image/jpg',
            'parents':  [FolderID]
          },
          media: {
            mimeType: 'image/jpg',
            body: fs.createReadStream(ImagePath),
          },
        });
    
        console.log(response.data);
      } catch (error) {
        console.log(error.message);
      }


    //console.log(imageName)
    // const driveService = google.drive({version: 'v3', auth});

    // let fileMetadata = {
    //     'name': imageName,
    //     'parents':  [FolderID]
    // };

    // let media = {
    //     mimeType: 'image/jpeg',
    //     body: fs.createReadStream(ImagePath)
    // };

    // let response = await driveService.files.create({
    //     resource: fileMetadata,
    //     media: media,
    //     fields: 'id'
    // });

    // switch(response.status){
    //     case 200:
    //         let file = response.result;
    //         console.log('Created image Id: ', response.data.id);
    //         break;
    //     default:
    //         console.error('Error creating the file, ' + response.errors);
    //         break;
    // }
}

app.post("/FolderMaker",async(req,res)=>{
    const {UserEmail,ImagePath} = req.body
    try {
        console.log(UserEmail,ImagePath)
        await createFolder(UserEmail).catch(console.error); //CALLING FUNCTION TO UPLOAD FILE
        InsertImageInFolder(ImagePath).catch(console.error);
        res.send({message: "MAKING FOLDER ON GOOGLE DRIVE"})
    } catch (err) {
        throw err;
    }
})
app.listen(9002,() => {
    console.log("BE started at port 9002")
})