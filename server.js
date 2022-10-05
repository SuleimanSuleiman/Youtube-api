const {
    app,
    connect
} = require('./app')

app.listen(4000, () => {
    connect()
    console.log('Server Running ...')
})