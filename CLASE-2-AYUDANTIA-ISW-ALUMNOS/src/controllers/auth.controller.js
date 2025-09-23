import { loginUser } from "../services/auth.service.js";
import { createUser } from "../services/user.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return handleErrorClient(res, 400, "Email y contraseña son requeridos");
    }
    
    const data = await loginUser(email, password);
    handleSuccess(res, 200, "Login exitoso", data);
  } catch (error) {
    handleErrorClient(res, 401, error.message);
  }
}

export async function register(req, res) {
  try {
    const data = req.body;
    
    if (!data.email || !data.password) {
      return handleErrorClient(res, 400, "Email y contraseña son requeridos");
    }
    
    const newUser = await createUser(data);
    delete newUser.password; // Nunca devolver la contraseña
    handleSuccess(res, 201, "Usuario registrado exitosamente", newUser);
  } catch (error) {
    if (error.code === '23505') { // Código de error de PostgreSQL para violación de unique constraint
      handleErrorClient(res, 409, "El email ya está registrado");
    } else {
      handleErrorServer(res, 500, "Error interno del servidor", error.message);
    }
  }
}

const userRepository = AppDataSource.getRepository(User);

// UPDATE PROFILE - PATCH /profile/private
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, password } = req.body;

        if (!email && !password) {
            return handleErrorClient(res, 400, "Se requiere email o password para actualizar");
        }

        const user = await userRepository.findOne({ where: { id: userId } });
        
        if (!user) {
            return handleErrorClient(res, 404, "Usuario no encontrado");
        }

        if (email) user.email = email;
        if (password) {
            const saltRounds = 10;
            user.password = await bcrypt.hash(password, saltRounds);
        }

        await userRepository.save(user);

        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        handleSuccess(res, 200, "Perfil actualizado exitosamente", userWithoutPassword);

    } catch (error) {
        if (error.code === '23505') {
            handleErrorClient(res, 409, "El email ya está registrado");
        } else {
            handleErrorServer(res, 500, "Error al actualizar perfil", error.message);
        }
    }
};

// DELETE PROFILE - DELETE /profile/private
export const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        await userRepository.update(userId, { estado_active: false });
        handleSuccess(res, 200, "Cuenta desactivada exitosamente", { id: userId });

    } catch (error) {
        handleErrorServer(res, 500, "Error al eliminar perfil", error.message);
    }
};