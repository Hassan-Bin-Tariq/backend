import express from "express"
import cors from "cors"
import mongoose from "mongoose"

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
    time: String,
    venue: String,
})

const Student = new mongoose.model("Student", studentSchema)
const Teacher = new mongoose.model("Teacher", teacherSchema)
const Mentor = new mongoose.model("Mentor", MentorSchema)
const Event = new mongoose.model("Event", EventSchema)
const AllteacherEmails = new mongoose.model("AllteacherEmails", TeacherEmailsSchema)
const MentorEmail = new mongoose.model("MentorEmail", MentorrEmailsSchema)
//Routes

app.post("/login",async (req,res)=>{
    const { email, password} = req.body
    let Emailss;
    let Mentormail;
    let teachermails = [];

    try { //getting all emails of teachers from back end and changing them into single list
        Emailss = await AllteacherEmails.find({});

        for (let i = 0; i < Emailss.length; i++) {
            teachermails.push(Emailss[i].email)
        }
        console.log(teachermails);
    } catch (err) {
        throw err;
    }

    try { //Mentor ki email database ma se nikali
        Mentormail = await MentorEmail.find({});
        console.log(Mentormail[0].email);
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
    const { name, email, password} = req.body

    try { //getting all emails of teachers from back end and changing them into single list
        Emailss = await AllteacherEmails.find({});

        for (let i = 0; i < Emailss.length; i++) {
            teachermails.push(Emailss[i].email)
        }
        console.log(teachermails);
    } catch (err) {
        throw err;
    }

    try { //Mentor ki email database ma se nikali
        Mentormail = await MentorEmail.find({});
        console.log(Mentormail[0].email);
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
                        res.send( { message: "Successfully Teacher Registered, Please login now." })
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
    const {title,teacherName,teacherEmail,teacherID,description,date,time,venue} = req.body
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
                time,
                venue
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
app.listen(9002,() => {
    console.log("BE started at port 9002")
})