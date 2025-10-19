import AbsBaseDomain from "@/abstracts/absBase.domain";

export default class TotpDomain extends AbsBaseDomain {

  // Call the parent constructor
  constructor() {
    super();
  }

  // Override onDestroy to add custom cleanup logic
  protected onDestroy(): void {
    this.logger.info(`${this.constructor.name} cleaned up resources`);
  }
}

// ================= Exporting Instance =================
export const totpDomain: TotpDomain = new TotpDomain();
