import { Singleton } from '../classes/singleton';

export class Pap extends Singleton {
  private static readonly tag: string = 'Pap';

  private static bootstrapped: boolean = false;

  public static async bootstrap(): Promise<void> {
    const tag: string = `${Pap.tag}.bootstrap()`;
    const errors: Error[] = [];
    Pap.bootstrapped = false;

    // Placeholder

    Pap.bootstrapped = true;
  }
}