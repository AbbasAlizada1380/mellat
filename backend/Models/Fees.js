import { DataTypes } from "sequelize";
import sequelize from "../dbconnection.js";
import { Athletes } from "./Athletes.js";

export const Fees = sequelize.define(
  "Fee",
  {
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    received: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    remained: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    athleteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "athletes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "fees",
    timestamps: true,

    hooks: {
      beforeValidate: (fee) => {
        fee.remained = Number(fee.total) - Number(fee.received);
      },
    },
  }
);
export default Fees;