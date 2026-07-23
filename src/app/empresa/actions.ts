"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export type CompanyInfoState = { error?: string; success?: boolean };

const COMPANY_ID = "singleton";

export async function updateCompanyInfo(
  _prevState: CompanyInfoState,
  formData: FormData
): Promise<CompanyInfoState> {
  await requirePermission("empresa", "edit");

  const name = String(formData.get("name") ?? "").trim() || null;
  const legalName = String(formData.get("legalName") ?? "").trim() || null;
  const cnpj = String(formData.get("cnpj") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const addressNumber = String(formData.get("addressNumber") ?? "").trim() || null;
  const neighborhood = String(formData.get("neighborhood") ?? "").trim() || null;
  const zipCode = String(formData.get("zipCode") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;

  const logo = formData.get("logo");
  let logoUrl: string | undefined;

  if (logo instanceof File && logo.size > 0) {
    const ext = path.extname(logo.name) || ".png";
    const fileName = `logo-${Date.now()}${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await logo.arrayBuffer());
    await writeFile(path.join(uploadsDir, fileName), buffer);
    logoUrl = `/uploads/${fileName}`;
  }

  await prisma.companyInfo.upsert({
    where: { id: COMPANY_ID },
    update: { name, legalName, cnpj, address, addressNumber, neighborhood, zipCode, city, phone, ...(logoUrl && { logoUrl }) },
    create: { id: COMPANY_ID, name, legalName, cnpj, address, addressNumber, neighborhood, zipCode, city, phone, logoUrl },
  });

  revalidatePath("/empresa");
  return { success: true };
}
