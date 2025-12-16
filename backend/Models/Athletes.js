import { DataTypes } from "sequelize";
import sequelize from "../dbconnection.js";

export const Athletes = sequelize.define(
  "Athlete",
  {
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    father_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    permanent_residence: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    current_residence: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    nic_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // Path or URL to uploaded PDF document
    document_pdf: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Path or URL to uploaded photo
    photo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "athletes",
    timestamps: true,
  }
);

export default Athletes;