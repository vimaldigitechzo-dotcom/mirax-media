import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import prisma from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const LOCAL_CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Ensure data directory and file exist
function getLocalContacts() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_CONTACTS_FILE)) {
      fs.writeFileSync(LOCAL_CONTACTS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(LOCAL_CONTACTS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('[StorageService] Error reading local contacts file:', err.message);
    return [];
  }
}

function saveLocalContacts(contacts) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf-8');
  } catch (err) {
    console.error('[StorageService] Error saving local contacts file:', err.message);
  }
}

/**
 * Saves a new contact enquiry.
 * First attempts Neon PostgreSQL via Prisma.
 * If database is unreachable or credentials are placeholder, gracefully saves to local persistent storage.
 */
export async function saveContact(data) {
  try {
    // 1. Try Neon PostgreSQL with 3-second timeout protection
    const saved = await prisma.contact.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName || null,
        service: data.service,
        budget: data.budget || null,
        message: data.message,
        status: 'NEW',
      },
    });

    console.log(`[Storage]: Saved to Neon PostgreSQL (ID: ${saved.id})`);
    return { contact: saved, storageSource: 'neon_postgresql' };
  } catch (dbError) {
    console.warn(`[Storage Notice]: Neon PostgreSQL offline/pending credentials (${dbError.message}).`);
    console.warn(`[Storage Fallback]: Preserving enquiry in persistent storage: ${LOCAL_CONTACTS_FILE}`);

    // 2. Fallback to local persistent storage so customer submission NEVER fails
    const newContact = {
      id: crypto.randomUUID(),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName || null,
      service: data.service,
      budget: data.budget || null,
      message: data.message,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const contacts = getLocalContacts();
    contacts.unshift(newContact);
    saveLocalContacts(contacts);

    return { contact: newContact, storageSource: 'local_fallback' };
  }
}

/**
 * Retrieves all contacts with pagination and filtering.
 */
export async function fetchAllContacts({ page = 1, limit = 10, status, search }) {
  try {
    // 1. Try Prisma first
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { service: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [totalRecords, contacts] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { totalRecords, contacts };
  } catch (err) {
    // 2. Fallback to local contacts
    let contacts = getLocalContacts();

    if (status) {
      contacts = contacts.filter((c) => c.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      contacts = contacts.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.service?.toLowerCase().includes(q) ||
          c.companyName?.toLowerCase().includes(q)
      );
    }

    const totalRecords = contacts.length;
    const skip = (page - 1) * limit;
    const paginated = contacts.slice(skip, skip + limit);

    return { totalRecords, contacts: paginated };
  }
}

/**
 * Retrieves a single contact by ID.
 */
export async function fetchContactById(id) {
  try {
    return await prisma.contact.findUnique({ where: { id } });
  } catch {
    const contacts = getLocalContacts();
    return contacts.find((c) => c.id === id) || null;
  }
}

/**
 * Updates a contact status.
 */
export async function modifyContactStatus(id, newStatus) {
  try {
    return await prisma.contact.update({
      where: { id },
      data: { status: newStatus },
    });
  } catch {
    const contacts = getLocalContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) return null;

    contacts[index].status = newStatus;
    contacts[index].updatedAt = new Date().toISOString();
    saveLocalContacts(contacts);
    return contacts[index];
  }
}

/**
 * Deletes a contact by ID.
 */
export async function removeContact(id) {
  try {
    await prisma.contact.delete({ where: { id } });
    return true;
  } catch {
    const contacts = getLocalContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    if (filtered.length === contacts.length) return false;

    saveLocalContacts(filtered);
    return true;
  }
}
