import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';



const app = express();
const port = 4000;
const db = new pg.Client({
    host:'localhost',
    port:1809,
    database:'School Journal',
    user:'postgres',
    password:'18Ihor',

})  ;

db.connect();

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))

app.get('/', (req, res)=>{
    res.render('index.ejs')
})

app.get('/newStudent', (req, res)=>{
    res.render('newStudent.ejs')
})
app.get('/newGrade', (req, res)=>{
    res.render('newGrade.ejs')
})

app.post('/add', async(req, res)=>{
    try{
        const firstName = req.body['firstname'];
        const lastName = req.body['lastname'];
        const fullName = lastName + ' '+ firstName
        const Class = req.body['class'];
        db.query('INSERT INTO student_list (full_name, class) VALUES ($1, $2)', [fullName, Class]);
        res.render('index.ejs')
    }
    catch(err){
        console.error(err, error.message)
    }
   
})
app.post('/grade', async(req, res)=>{
    const firstName = req.body['firstname'];
    const lastName = req.body['lastname'];
    const fullName = lastName +' '+firstName
    const subject = req.body['subject'];
    const grade = req.body['grade'];

    const studentId = await db.query('SELECT id FROM student_list WHERE full_name = $1', [fullName]);
    
    await db.query('INSERT INTO grades (subject, mark, student_id) VALUES ($1, $2, $3)', [subject, grade, studentId.rows[0].id]);
    res.redirect('/')
})
app.post('/find', async(req, res)=>{
    try{
        const fullName = req.body['fullname'];
        const Id = await db.query('SELECT id FROM student_list WHERE full_name = $1', [fullName]);
        const studentId = Id.rows[0].id;
        const name = await db.query('SELECT full_name FROM student_list WHERE id = $1', [studentId]);
        const subject = await db.query('SELECT subject FROM grades WHERE student_id = $1', [studentId]);
        const grade = await db.query('SELECT mark FROM grades WHERE student_id = $1', [studentId]);
        const subjects = subject.rows;
        const Grade = grade.rows;
        res.render('index.ejs', {
            subjects: subjects,
            grade: Grade,
            full_name:name
    })

    }
    catch(err){
        const error = 'No student found';
        console.log(err)

    }
    
    


})


app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})