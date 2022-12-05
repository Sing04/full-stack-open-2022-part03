const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.9f3uyet.mongodb.net/personApp?retryWrites=true&w=majority`

const noteSchema = new mongoose.Schema({
    name: String,
    number: String
  })
  
const Person = mongoose.model('Person', noteSchema)

if (process.argv.length === 3) {
    console.log('phonebook:')
    mongoose
    .connect(url)
    .then((result) => {
        Person.find({}).then(persons => {
            persons.forEach(person => {
                console.log(`${person.name} ${person.number}` )
            })
            mongoose.connection.close()
        })
    })
    .catch((err) => console.log(err))
}

if (process.argv.length === 4) {
    console.log('Please provide the password, a name and a number: node mongo.js <password> <name> <number>')
    process.exit(1)
  }

if (process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    mongoose
    .connect(url)
    .then((result) => {

        const person = new Person({
        name: name,
        number: number,
        })

        return person.save()
    })
    .then(() => {
        console.log(`added ${name} number ${number} to phonebook`)
        return mongoose.connection.close()
    })
    .catch((err) => console.log(err))
}