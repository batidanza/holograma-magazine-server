const db = require("../database/models");

const createOrUpdateUser = async (req, res) => {
  try {
    const { uid, email, display_name } = req.body;

    const [user, created] = await db.User.findOrCreate({
      where: { uid },
      defaults: {
        email,
        display_name,
        role: "lector"
      }
    });

    if (!created) {
      await user.update({
        email,
        display_name,
      });
    }

    res.json({
      message: created ? "Usuario creado exitosamente" : "Usuario actualizado exitosamente",
      user
    });
  } catch (error) {
    console.error("Error al crear/actualizar usuario:", error);
    res.status(500).json({ error: "Error al procesar la solicitud del usuario" });
  }
};

const getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await db.User.findByPk(uid);
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener información del usuario" });
  }
};

module.exports = {
  createOrUpdateUser,
  getUserByUid
};