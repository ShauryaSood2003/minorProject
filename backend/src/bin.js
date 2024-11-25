
import { connectDB } from "./databases/index.js";
import { app } from "./server.js";

const PORT = process.env.PORT  ;
// console.log(PORT) ;

// connect to the database
connectDB()
.then((dbInstance) => {
    console.log(`Database connected successfully: ${dbInstance.connection.host}`)

    app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
    
})
.catch((err) => console.log(err)) ;
