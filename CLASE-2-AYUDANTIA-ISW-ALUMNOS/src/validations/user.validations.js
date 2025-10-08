import joi from 'joi';

export const usuarioBodyValidation = joi.object({
email : joi.string().email().required().messages({
'string.empty': 'El correo no puede estar vacío',
'string.email': 'El correo debe ser una dirección de correo electrónico válida',
'any.required': 'El correo es obligatorio'
}),

password : joi.string().min(5).required().messages({
'string.empty': 'La contraseña no puede estar vacía',
'string.min': 'La contraseña debe tener al menos 5 caracteres',
'any.required': 'La contraseña es obligatoria'
})
})


