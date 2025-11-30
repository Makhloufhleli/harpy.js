import { Injectable } from "@nestjs/common";

@Injectable()
export class HomeService {
  getItems(): string[] {
    return ["Item1", "Item2", "Item3"];
  }
}
