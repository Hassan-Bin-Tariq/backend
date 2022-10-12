import express from "express"
import cors from "cors"
import mongoose from "mongoose"

//Removed all tests
//from tt
const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

const Teachers_emails = ["m.habib@nu.edu.pk", "usman.joyia@nu.edu.pk", "usman.ghous@nu.edu.pk"];
const MentorEmail = "tahir@nu.edu.pk";

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
//Routes

app.post("/login",(req,res)=>{
    const { email, password} = req.body
    if(Teachers_emails.includes(email))
    {
        Teacher.findOne({ email: email}, (err, user) => {
            if(user){
                if(password === user.password ) {
                    res.send({message: "Login Successfull", user: user})
                } else {
                    res.send({ message: "Password didn't match"})
                }
            } else {
                res.send({message: "User not registered"})
            }
        })
    }
    else if(MentorEmail == email)
    {
        Mentor.findOne({ email: email}, (err, user) => {
            if(user){
                if(password === user.password ) {
                    res.send({message: "Login Successfull", user: user})
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
                    res.send({message: "Login Successfull", user: user})
                } else {
                    res.send({ message: "Password didn't match"})
                }
            } else {
                res.send({message: "User not registered"})
            }
        })
    }
})
app.post("/register",(req,res)=>{
    const { name, email, password} = req.body
    Teacher.findOne({email: email}, (err, user) => {
        if(user){
            res.send({message: "User already registerd"})
        } else {
            if(Teachers_emails.includes(email))
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
            else if (email.includes("nu.edu.pk") && email != MentorEmail){
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
            else if(email == MentorEmail)
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