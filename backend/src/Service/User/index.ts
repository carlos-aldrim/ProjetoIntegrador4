import { SaveUserDTO } from "../../DTO/User/SaveUserDTO";
import { UpdateUserDTO } from "../../DTO/User/UpdateUserDTO";
import { AppLogger } from "../../Logger/AppLogger";
import { UserRepository } from "../../Repository/User";
import { encrypt } from "../../Util/Cryptography";

export class UserService {
  constructor(private userRepository: UserRepository) { }

  async Save({ mail, password, image, person }: SaveUserDTO) {
    try {
      const user = await this.userRepository.Save({
        mail,
        image,
        person,
        password: encrypt(password),
      });
      return user;
    } catch (error: any) {
      new AppLogger().error(error);
      return null;
    }
  }

  async Login(mail: string, password: string) {
    try {
      const user = await this.userRepository.Login(mail, password);
      return user;
    } catch (error: any) {
      new AppLogger().error(error);
      return null;
    }
  }

  async FindByEmail(mail: string) {
    try {
      const user = await this.userRepository.FindByEmail(mail);
      return user;
    } catch (error: any) {
      new AppLogger().error(error);
      return [];
    }
  }

  async Update(
    { isActive, mail, password, image, person }: UpdateUserDTO,
    id: string
  ) {
    try {
      const encryptedPassword = password ? encrypt(password) : password;
      await this.userRepository.Update(
        { isActive, mail, password: encryptedPassword, image, person },
        id
      );
      return true;
    } catch (error: any) {
      console.error(error);
      new AppLogger().error(error);
      return null;
    }
  }

  async Delete(id: string) {
    try {
      const userDelete = await this.userRepository.Delete(id);
      return userDelete;
    } catch (error: any) {
      new AppLogger().error(error);
      return null;
    }
  }

  async FindUserById(id: string) {
    try {
      const user = await this.userRepository.FindUserById(id);
      return user;
    } catch (error: any) {
      new AppLogger().error(error);
      return null;
    }
  }

  async FindByCpf(cpf: string) {
    try {
      const user = await this.userRepository.FindByCpf(cpf);
      return user;
    } catch (error: any) {
      new AppLogger().error(error);
      return [];
    }
  }
}