import { WorkOrderRecord } from '../types';
import { parseDate } from './dataParser';

export function generateSampleRecords(): WorkOrderRecord[] {
  const units = [
    { code: '54110', name: 'ULP Panrita Lopi' },
    { code: '54120', name: 'ULP Sinjai' },
    { code: '54130', name: 'ULP Bantaeng' },
    { code: '54140', name: 'ULP Kepulauan Selayar' },
    { code: '54150', name: 'ULP Tanete' },
  ];

  const penyulangs = [
    'Penyulang Tanete',
    'Penyulang Kota Bulukumba',
    'Penyulang Bira',
    'Penyulang Eremerasa',
    'Penyulang Sinjai Kota',
    'Penyulang Benteng Selayar',
    'Penyulang Lanto Dg Pasewang',
    'Penyulang Matekko',
  ];

  const descriptions = [
    'Pemangkasan Pohon & Right of Way (ROW) Jalur JTM 20kV',
    'Perbaikan Klem Sambungan Jumper Tiang Portal',
    'Penggantian Isolator Tumpu Pecah Fasa R-S-T',
    'Inspeksi Termovisi Sambungan & Gardu Trafo Distribusi',
    'Perbaikan Arrester Trafo Distribusi Pasca Petir',
    'Pemeliharaan Preventif Recloser & LBS Motorized',
    'Penggantian Fused Cut Out (FCO) & Fuse Link 10A',
    'Pemasangan Penghalang Panjat Satwa / Ijuk',
    'Penarikan Konduktor JTM Kendor Akibat Tertimpa Ranting',
    'Penggantian Lightning Arrester Gardu Sisipan',
    'Pemeriksaan Beban Puncak & Keseimbangan Trafo Distribusi',
    'Perbaikan Grounding / Pembumian Netral Gardu',
  ];

  const workTypes = ['PM', 'CM', 'INSP', 'EM', 'PDM'];
  const statuses: ('COMP' | 'WFOLLOWUP' | 'WFCOMP')[] = ['COMP', 'WFOLLOWUP', 'WFCOMP'];
  
  const records: WorkOrderRecord[] = [];
  let woSeed = 10450000;

  // Generate data across August 2026 (Days 1 to 31) and July 2026 (Days 1 to 31)
  const months = [
    { year: 2026, month: 8, days: 31, name: 'Agustus' },
    { year: 2026, month: 7, days: 31, name: 'Juli' },
  ];

  months.forEach((mObj) => {
    for (let day = 1; day <= mObj.days; day++) {
      // Create between 4 to 12 work orders per day
      const dailyCount = 4 + ((day * 7 + mObj.month * 3) % 9);

      for (let i = 0; i < dailyCount; i++) {
        woSeed += 1;
        const u = units[(day + i) % units.length];
        const p = penyulangs[(day * 2 + i) % penyulangs.length];
        const desc = descriptions[(day + i * 3) % descriptions.length];
        const wt = workTypes[(day + i) % workTypes.length];
        
        // Distribution: COMP ~60%, WFOLLOWUP ~25%, WFCOMP ~15%
        const rand = (day * 13 + i * 17) % 100;
        let st: 'COMP' | 'WFOLLOWUP' | 'WFCOMP' = 'COMP';
        if (rand < 55) st = 'COMP';
        else if (rand < 82) st = 'WFOLLOWUP';
        else st = 'WFCOMP';

        const dayStr = String(day).padStart(2, '0');
        const monthStr = String(mObj.month).padStart(2, '0');
        const dateStr = `${dayStr}/${monthStr}/${mObj.year}`;
        const ym = `${mObj.year}-${monthStr}`;

        records.push({
          id: `sample-${woSeed}`,
          workOrder: String(woSeed),
          description: desc,
          workType: wt,
          location: 'UP3 BULUKUMBA',
          asset: `GDR-BLK-${(day % 15) + 1}`,
          owner: 'PLN UP3 BULUKUMBA',
          unit: u.code,
          status: st,
          unitDescription: u.name,
          po: `PO-PLN-2026-${(woSeed % 900) + 100}`,
          reportedDate: `${String(Math.max(1, day - 2)).padStart(2, '0')}/${monthStr}/${mObj.year}`,
          scheduledStart: `${dayStr}/${monthStr}/${mObj.year}`,
          hiValue: String(((day * 5 + i * 3) % 40) + 60),
          descriptionPenyulang: p,
          statusDate: dateStr,
          statusDay: day,
          statusMonth: mObj.month,
          statusYear: mObj.year,
          statusYearMonth: ym,
          priority: String(((i % 3) + 1)),
          originatingRecord: `SR-${(woSeed % 8000) + 1000}`,
          site: 'SULSELRABAR',
          bulan: mObj.name,
          up3: 'UP3 BULUKUMBA',
          insp: 'TIM T&D HAR',
          jenisWo: 'T&D',
          panjangJtm: `${((day * 3 + i) % 8) + 1.5} kms`,
          fasa: ['R-S-T', 'R', 'S', 'T'][(day + i) % 4],
          year: String(mObj.year),
          raw: {},
        });
      }
    }
  });

  return records;
}
