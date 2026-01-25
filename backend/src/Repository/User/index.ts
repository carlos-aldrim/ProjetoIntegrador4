import { PrismaClient } from "@prisma/client";
import { v4 } from "uuid";
import { SaveUserDTO } from "../../DTO/User/SaveUserDTO";
import { UpdateUserDTO } from "../../DTO/User/UpdateUserDTO";
import { User } from "../../DTO/User/UserDTO";

export class UserRepository {
  constructor(private prisma: PrismaClient) { }

  async Save(userData: SaveUserDTO): Promise<string[]> {

    const { mail, password, image, person } = userData;

    const existing = await this.prisma.$queryRaw<User[]>`
      SELECT id FROM "main"."users" WHERE "mail" = ${mail} AND "deletionDate" IS NULL
    `;
    if (existing.length > 0) {
      throw new Error("E-mail já cadastrado para usuário ativo.");
    }

    const existingCpf = await this.prisma.$queryRaw<User[]>`
      SELECT u.id FROM "main"."users" u
      LEFT JOIN "main"."persons" p ON u."personId" = p."id"
      WHERE p."cpf" = ${person.cpf} AND u."deletionDate" IS NULL
    `;
    if (existingCpf.length > 0) {
      throw new Error("CPF já cadastrado para usuário ativo.");
    }

    const userId = v4();
    const personId = v4();
    const addressId = v4();

    const transaction = await this.prisma.$transaction(async (prisma) => {
      await prisma.$executeRaw`
            INSERT INTO "main"."persons" (
                "id", "firstName", "lastName", "cpf", "birthDate", "phone", 
                "creationDate", "updateDate", "deletionDate"
            ) VALUES (
                ${personId}, 
                ${person.firstName}, 
                ${person.lastName}, 
                ${person.cpf}, 
                ${new Date(person.birthDate)}, 
                ${person.phone}, 
                ${new Date()}, 
                ${new Date()}, 
                null
            );
        `;

      await prisma.$executeRaw`
            INSERT INTO "main"."users" (
                "id", "mail", "password", "image", "isActive", 
                "recoverPassword", "creationDate", "updateDate", "deletionDate", "personId"
            ) VALUES (
                ${userId}, 
                ${mail}, 
                ${password}, 
                ${image}, 
                false, 
                ${v4()}, 
                ${new Date()}, 
                ${new Date()}, 
                null, 
                ${personId}
            );
        `;

      await prisma.$executeRaw`
            INSERT INTO "main"."addresses" (
                "id", "zipCode", "addressLine", "addressLineNumber", "neighborhood", "city", "state", 
                "personId", "creationDate", "updateDate", "deletionDate"
            ) VALUES (
                ${addressId}, 
                ${person.address.zipCode}, 
                ${person.address.addressLine}, 
                ${person.address.addressLineNumber}, 
                ${person.address.neighborhood}, 
                ${person.address.city}, 
                ${person.address.state}, 
                ${personId}, 
                ${new Date()}, 
                ${new Date()}, 
                null
            );
        `;

      return userId;
    });

    return [transaction];
  }

  async Login(mail: string, password: string): Promise<User[]> {
    const user = await this.prisma.$queryRaw<User[]>`
      SELECT 
        "id", "name", "mail", "password", "image", "isActive", "recoverPassword"
      FROM "main"."users"
      WHERE "mail" = ${mail} AND "password" = ${password} AND "deletionDate" IS NULL
    `;
    return user;
  }

  async FindByEmail(mail: string): Promise<User[]> {
    const user = await this.prisma.$queryRaw<User[]>`
      SELECT 
        u.id, u.mail, u.password, u.image, u.isActive, u.recoverPassword,
        p.firstName, p.lastName, p.cpf, p.birthDate, p.phone,
        a.zipCode, a.addressLine, a.addressLineNumber, a.neighborhood, a.city, a.state
      FROM "main"."users" u
      LEFT JOIN "main"."persons" p ON u.personId = p.id
      LEFT JOIN "main"."addresses" a ON p.id = a.personId
      WHERE u.mail = ${mail} AND u.deletionDate IS NULL;
    `;

    return user;
  }

  async FindUserById(id: string): Promise<User[]> {
    const user = await this.prisma.$queryRaw<User[]>`
      SELECT 
        u.id, u.mail, u.password, u.image, u.isActive, u.recoverPassword,
        p.firstName, p.lastName, p.cpf, p.birthDate, p.phone,
        a.zipCode, a.addressLine, a.addressLineNumber, a.neighborhood, a.city, a.state
      FROM "main"."users" u
      LEFT JOIN "main"."persons" p ON u.personId = p.id
      LEFT JOIN "main"."addresses" a ON p.id = a.personId
      WHERE u.id = ${id} AND u.deletionDate IS NULL;
    `;

    return user;
  }

  async Update(user: UpdateUserDTO, id: string): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      const updateUserFields: string[] = [];
      if (user.mail) updateUserFields.push(`"mail" = '${user.mail}'`);
      if (user.image) updateUserFields.push(`"image" = '${user.image}'`);
      if (user.isActive !== undefined)
        updateUserFields.push(`"isActive" = ${user.isActive}`);
      if (user.password) updateUserFields.push(`"password" = '${user.password}'`);

      if (updateUserFields.length > 0) {
        console.log("Updating users table...");
        await prisma.$executeRawUnsafe(`
          UPDATE "main"."users"
          SET ${updateUserFields.join(", ")}
          WHERE "id" = '${id}'
        `);
      }

      console.log("Fetching personId...");
      const person = await prisma.$queryRaw<{ personId: string }[]>`
        SELECT "personId"
        FROM "main"."users"
        WHERE "id" = ${id}
      `;

      const personId = person[0]?.personId;
      console.log("PersonId found:", personId);

      if (user.person && personId) {
        const { firstName, lastName, cpf, birthDate, phone, address } =
          user.person;

        const updatePersonFields: string[] = [];
        if (firstName) updatePersonFields.push(`"firstName" = '${firstName}'`);
        if (lastName) updatePersonFields.push(`"lastName" = '${lastName}'`);
        if (cpf) updatePersonFields.push(`"cpf" = '${cpf}'`);
        if (birthDate) updatePersonFields.push(`"birthDate" = '${birthDate}'`);
        if (phone) updatePersonFields.push(`"phone" = '${phone}'`);

        if (updatePersonFields.length > 0) {
          await prisma.$executeRawUnsafe(`
            UPDATE "main"."persons"
            SET ${updatePersonFields.join(", ")}
            WHERE "id" = '${personId}'
          `);
        }

        if (address) {
          const updateAddressFields: string[] = [];
          if (address.zipCode)
            updateAddressFields.push(`"zipCode" = '${address.zipCode}'`);
          if (address.addressLine)
            updateAddressFields.push(`"addressLine" = '${address.addressLine}'`);
          if (address.addressLineNumber)
            updateAddressFields.push(
              `"addressLineNumber" = '${address.addressLineNumber}'`
            );
          if (address.neighborhood)
            updateAddressFields.push(
              `"neighborhood" = '${address.neighborhood}'`
            );
          if (address.city)
            updateAddressFields.push(`"city" = '${address.city}'`);
          if (address.state)
            updateAddressFields.push(`"state" = '${address.state}'`);

          if (updateAddressFields.length > 0) {
            await prisma.$executeRawUnsafe(`
              UPDATE "main"."addresses"
              SET ${updateAddressFields.join(", ")}
              WHERE "personId" = '${personId}'
            `);
          }
        }
      }
    });
  }

  async Delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      const resultUser = await prisma.$queryRaw`
        UPDATE "main"."users"
        SET "deletionDate" = ${new Date()}
        WHERE "id" = ${id}
      `;

      const person = await prisma.$queryRaw<{ personId: string }[]>`
        SELECT "personId" 
        FROM "main"."users"
        WHERE "id" = ${id}
      `;

      const personId = person[0]?.personId;

      const resultPerson = await prisma.$queryRaw`
        UPDATE "main"."persons"
        SET "deletionDate" = ${new Date()}
        WHERE "id" = ${personId}
      `;

      const resultAddress = await prisma.$queryRaw`
        UPDATE "main"."addresses"
        SET "deletionDate" = ${new Date()}
        WHERE "personId" = ${personId}
      `;
    });
  }

  async FindByCpf(cpf: string): Promise<User[]> {
    const user = await this.prisma.$queryRaw<User[]>`
      SELECT 
        u.id, u.mail, u.password, u.image, u.isActive, u.recoverPassword,
        p.firstName, p.lastName, p.cpf, p.birthDate, p.phone,
        a.zipCode, a.addressLine, a.addressLineNumber, a.neighborhood, a.city, a.state
      FROM "main"."users" u
      LEFT JOIN "main"."persons" p ON u.personId = p.id
      LEFT JOIN "main"."addresses" a ON p.id = a.personId
      WHERE p.cpf = ${cpf}
        AND u.deletionDate IS NULL;
    `;

    return user;
  }

  async UpdateRecoverPasswordToken(mail: string, token: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "main"."users"
      SET "recoverPassword" = ${token}
      WHERE "mail" = ${mail} AND "deletionDate" IS NULL;
    `;
  }

  async UpdatePassword(mail: string, password: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "main"."users"
      SET "password" = ${password}
      WHERE "mail" = ${mail} AND "deletionDate" IS NULL;
    `;
  }
}
