import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import { google } from "googleapis"
import fs from "fs"

var FolderID;

const CLIENT_ID = '52753542950-juopkkoe7u7ufh9i5rjn7ob63335ufq7.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04dUJx8bUWp4SCgYIARAAGAQSNwF-L9Ir5a2zXRhkTe9eRRqG8V1QuzlrN97kD9rV5q9yZCihGtGV2JjorgNaYlEKew5UdHgEll0';

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
//const bodyParser = require("body-parser");
app.use(express.json())
app.use(cors())
//app.use(bodyParser.json());
//app.use(bodyParser.json());


mongoose.connect("mongodb+srv://hassan:hassan123@cluster0.brlttau.mongodb.net/Mediascape?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("DB connected")
})

//inventory table
const InventorySchema = new mongoose.Schema({
    date:String,
    time:String,
    am:String,
    gadget:String
    
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
    password: String,
    FolderID: String
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

const GenEventSchema = new mongoose.Schema({
    headEmail: String,
    headEmail: String,
    userID: String,
    title: String,
    description: String,
    date: String,
    StartTime: String,
    EndTime: String,
    venue: String,
    status: String,
})

const pollSchema = new mongoose.Schema({
    question: String,
    options: [String],
    responses: [String],
});



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
const InventoryTable = new mongoose.model("InventoryTable",InventorySchema)
const GenEvent = new mongoose.model("GenEvent", GenEventSchema)
const Poll = new mongoose.model('Poll', pollSchema);

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
    const { name, email, password, slots, Duty,FolderID} = req.body

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
                    password,
                    FolderID
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
            'parents':  ['1vv4xpJyFiEyts4grXbUz9p8utyX_XexG']
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

async function InsertImageInFolder(UserEmail,ImagePath){

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
}

app.post("/FolderMaker",async(req,res)=>{
    const {UserEmail,ImagePath} = req.body
    try {
        console.log(UserEmail,ImagePath)
        await createFolder(UserEmail).catch(console.error); //CALLING FUNCTION TO UPLOAD FILE
        InsertImageInFolder(UserEmail,ImagePath).catch(console.error);
        res.send({message: "MAKING FOLDER ON GOOGLE DRIVE",Folder:FolderID})
    } catch (err) {
        throw err;
    }
})


var rollNumbers = [];
var folderIDS = [];
var imageIDS = [];
var imageURLS = [];
var dict = {};
async function listFolders() {
try {


    const result = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and '1vv4xpJyFiEyts4grXbUz9p8utyX_XexG' in parents"
        //parent: fileId 
      //fields: 'webViewLink, webContentLink'
    });
    for (let i = 0; i < result.data.files.length; i++) {
        rollNumbers.push(result.data.files[i].name)
        folderIDS.push(result.data.files[i].id)
    }
    console.log(rollNumbers);
    console.log(folderIDS);
} catch (error) {
    console.log(error.message);
}
}

async function getpicsInsideFolders() {
try {
    for (let i = 0; i < folderIDS.length; i++) {    
      //console.log(folderIDS[i])
        const result = await drive.files.list({
        q:"mimeType='image/jpeg'and '"+folderIDS[i]+"' in parents"
        });
      imageIDS.push(result.data.files[0].id) //SIRF PEHLI PEHLI FILES UTHANI HA MATCH KRNEY K LIA JO SIGN UP K TIME DI USER NE
    }
    console.log(imageIDS)
    } catch (error) {
    console.log(error.message);
    }
}

async function generateUrls() {
    try {

        for (let i = 0; i < imageIDS.length; i++) {
            const result = await drive.files.get({
            fileId: imageIDS[i],
            fields: 'webViewLink, webContentLink'
            });
            imageURLS.push(result.data.webViewLink)
        }
        console.log(imageURLS);
    } 
    catch (error) {
        console.log(error.message);
    }
}

function generateDictonary(){
    for (let i = 0; i < imageURLS.length; i++) {
    dict[rollNumbers[i]] = imageURLS[i];
    }
    console.log(dict)
}

app.post("/DriveDataGetter",async(req,res)=>{
    rollNumbers = [];
    folderIDS = [];
    imageIDS = [];
    imageURLS = [];
    dict = {};
    console.log("inside data getter")
    await listFolders()
    await getpicsInsideFolders()
    await generateUrls()
    await generateDictonary()

    res.send({message: "got data", Data: dict})
})


async function uploadToDesiredFolder(path,FolderName) {
    //console.log(FolderName)
    const res = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and trashed = false and name='${FolderName}'`,
        fields: 'nextPageToken, ' +
                'files(id, name)'
    });
    const files = res.data.files;
    if (files.length) {
        console.log(files[0].id);
        var n = path.lastIndexOf('/');  //FOLDER ID GET KRK US MA IMAGE INSERT KR DO
        var imageName = path.substring(n + 1);
    
        try {
            const response = await drive.files.create({
                
            requestBody: {
                name: imageName, //This can be name of your choice
                mimeType: 'image/jpg',
                'parents':  [files[0].id]
            },
            media: {
                mimeType: 'image/jpg',
                body: fs.createReadStream(path),
            },
            });
        
            console.log(response.data);
        } catch (error) {
            console.log(error.message);
        }

    } else {
        console.log(`No folder found with name: ${FolderName}`);
    }
}
app.post("/UploadToDrive",async(req,res)=>{
    
    const {UploadData} = req.body
    console.log(UploadData);
    //await uploadToDesiredFolder("19F-0387@nu.edu.pk")
    for (const [key, value] of Object.entries(UploadData)) {
        console.log(key, value);
        await uploadToDesiredFolder(key,value)
    }
})


async function getImagesInFolder(folder,images) {
    try {
        console.log("Paresnt: ",folder)
        const result = await drive.files.list({
            q:"mimeType='image/jpeg'and '"+folder+"' in parents"
        });
        for (let i = 0; i < result.data.files.length; i++) {
            images.push(result.data.files[i].id)
        }
    } 
    catch (error) {
        console.log(error.message);
    }
}

async function UrlMaker(urlsForLogedIn,imageIds){
    try {
        
        for (let i = 0; i < imageIds.length; i++) {
            const result = await drive.files.get({
            fileId: imageIds[i],
            fields: 'webViewLink, webContentLink'
            });
            urlsForLogedIn.push(result.data.webViewLink)
        }
    } 
    catch (error) {
        console.log(error.message);
    }
}

app.post("/GetImages",async(req,res)=>{
    const {Folder} = req.body
    var images = []
    var urlsForLogedIn = []
    await getImagesInFolder(Folder,images)
    //console.log(images);
    await UrlMaker(urlsForLogedIn,images)
    console.log(urlsForLogedIn)
    res.send({message: "got URLS", urlsForLogedIn})
})

// GENERATE EVENT REQUESTS
app.post("/GenerateEventRequest",(req,res)=>{
    const {title,headName,headEmail,userID,description,date,StartTime,EndTime,venue,status} = req.body
    GenEvent.findOne({title: title}, (err, genevent) => {
        if(genevent){
            res.send({message: "Event already created"})
        } 
        else{
            const user = new GenEvent({
                headName,
                headEmail,
                userID,
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
                    res.send( { message: "Successfully generated an FPS event." })
                }
            })
        }
    })
})

//GET GENERATED EVENTS
app.post("/GetGeneratedEvent",async(req,res)=>{
    try {
        const results = await GenEvent.find({});
        res.send({message: "Got All Generated Events", genevent: results})
        console.log("events fetched from db");
    } catch (err) {
        throw err;
    }
})

//create poll
app.post("/createpoll",async (req,res)=>
{
console.log("asd")
const { question, options, response } = req.body;
const poll = await Poll.findOne({ question });
    
    if (!poll) {
        const newPoll = new Poll({
            question,
            options,
            responses: [response],
        });
    
        await newPoll.save();
    
        return res.status(201).json(newPoll);
        }
    
        poll.responses.push(response);
    
        await poll.save();
    
        console.log(poll)
        res.json(poll);
})
app.get('/cpolls', async (req, res) => {
    const polls = await Poll.find();
    res.json(polls);
});

//inventory routes
app.post("/invent", async (req, res) => {
    console.log("hassan")
    const tableData = req.body;
    var date = tableData.tableData[0][0];
    console.log(date);
    const result = new InventoryTable({
        date
    });
    result.save(err => {
        if(err) {
            res.send(err)
        } else {
            res.send( { message: "Inventory updated." })
        }
    })
});

app.listen(9002,() => {
    console.log("BE started at port 9002")
})