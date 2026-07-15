import * as Contacts from 'expo-contacts';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { buildVCard } from '../utils/vcard';

export async function saveProfileToContacts(profile) {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('연락처 저장 권한이 거부되었습니다.');
  }

  const contact = {
    contactType: Contacts.ContactTypes.Person,
    name: profile.fullName,
    firstName: profile.fullName,
    company: profile.company || undefined,
    jobTitle: profile.title || undefined,
    note: profile.note || undefined,
  };

  if (profile.phone?.trim()) {
    contact.phoneNumbers = [{ label: 'mobile', number: profile.phone.trim() }];
  }
  if (profile.email?.trim()) {
    contact.emails = [{ label: 'work', email: profile.email.trim() }];
  }
  if (profile.website?.trim()) {
    contact.urlAddresses = [{ label: 'homepage', url: profile.website.trim() }];
  }
  if (profile.address?.trim()) {
    contact.addresses = [
      {
        label: 'work',
        street: profile.address.trim(),
        country: '대한민국',
      },
    ];
  }

  return Contacts.addContactAsync(contact);
}

export async function shareVCardFile(profile) {
  const vcard = buildVCard(profile);
  const safeName = (profile.fullName?.trim() || 'contact').replace(/[^\w가-힣.-]/g, '_');
  const fileUri = `${FileSystem.cacheDirectory}${safeName}.vcf`;

  await FileSystem.writeAsStringAsync(fileUri, vcard, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('이 기기에서 파일 공유를 사용할 수 없습니다.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/vcard',
    dialogTitle: '전자명함 공유',
    UTI: 'public.vcard',
  });
}
