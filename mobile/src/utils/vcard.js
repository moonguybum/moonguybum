export const EMPTY_PROFILE = {
  fullName: '',
  company: '',
  title: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  note: '',
};

function escapeVCardValue(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function foldVCardLine(line) {
  const maxLength = 75;
  if (line.length <= maxLength) return line;

  const parts = [line.slice(0, maxLength)];
  let offset = maxLength;

  while (offset < line.length) {
    parts.push(` ${line.slice(offset, offset + maxLength - 1)}`);
    offset += maxLength - 1;
  }

  return parts.join('\r\n');
}

export function buildVCard(profile) {
  const name = profile.fullName.trim();
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCardValue(name)}`,
    `N:${escapeVCardValue(name)};;;;`,
  ];

  if (profile.company?.trim()) {
    lines.push(`ORG:${escapeVCardValue(profile.company.trim())}`);
  }
  if (profile.title?.trim()) {
    lines.push(`TITLE:${escapeVCardValue(profile.title.trim())}`);
  }
  if (profile.phone?.trim()) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(profile.phone.trim())}`);
  }
  if (profile.email?.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(profile.email.trim())}`);
  }
  if (profile.website?.trim()) {
    lines.push(`URL:${escapeVCardValue(profile.website.trim())}`);
  }
  if (profile.address?.trim()) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCardValue(profile.address.trim())};;;;`);
  }
  if (profile.note?.trim()) {
    lines.push(`NOTE:${escapeVCardValue(profile.note.trim())}`);
  }

  lines.push('END:VCARD');
  return lines.map(foldVCardLine).join('\r\n');
}

function unescapeVCardValue(value) {
  return String(value)
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function getPropertyKey(line) {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return null;
  return line.slice(0, colonIndex).toUpperCase().split(';')[0];
}

function getPropertyValue(line) {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return '';
  return unescapeVCardValue(line.slice(colonIndex + 1).trim());
}

export function parseVCard(vcardText) {
  const unfolded = vcardText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '');

  const profile = { ...EMPTY_PROFILE };

  for (const rawLine of unfolded.split('\n')) {
    const line = rawLine.trim();
    if (!line || line === 'BEGIN:VCARD' || line === 'END:VCARD') continue;

    const key = getPropertyKey(line);
    const value = getPropertyValue(line);
    if (!value) continue;

    switch (key) {
      case 'FN':
        profile.fullName = value;
        break;
      case 'N':
        if (!profile.fullName) {
          profile.fullName = value.split(';')[0] || value;
        }
        break;
      case 'ORG':
        profile.company = value;
        break;
      case 'TITLE':
        profile.title = value;
        break;
      case 'TEL':
        profile.phone = value;
        break;
      case 'EMAIL':
        profile.email = value;
        break;
      case 'URL':
        profile.website = value;
        break;
      case 'ADR': {
        const parts = value.split(';').filter(Boolean);
        profile.address = parts[parts.length - 1] || value;
        break;
      }
      case 'NOTE':
        profile.note = value;
        break;
      default:
        break;
    }
  }

  return profile;
}

export function validateProfile(profile) {
  if (!profile.fullName?.trim()) {
    return '이름은 필수입니다.';
  }
  if (!profile.phone?.trim() && !profile.email?.trim()) {
    return '전화번호 또는 이메일 중 하나는 필요합니다.';
  }
  return null;
}
