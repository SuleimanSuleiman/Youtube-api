module.exports.handleError = (status ,message ,stack) =>{
    let err = new Error()
    err.status  = status
    err.message = message
    err.stack = stack
    return err
}

module.exports.handleMessageError = (err) =>{
    let errors = {
        first_name: "",
        last_name: "",
        email: "",
        password: ""
    }

    if(err.message.includes('User validation failed')){
        Object.values(err.errors).forEach((error) =>{
            errors[error.path] = error.message
        })
    }
    
    if(err.code === 11000){
        errors['email'] = 'pleace try with anther email'
    }

    if(err.message === 'incurrect password'){
        errors['password']  = 'incurrect password'
    }

    return errors
}

module.exports.handleMessageErrorForVedio = (err) =>{
    let errors = {title: ''}
    if(err.code === 11000){
        errors['title'] = 'pleace try with another title'
    }
    return errors
}
