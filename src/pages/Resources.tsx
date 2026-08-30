import { useState } from 'react';
import { PageHeader, StatusBadge, Tabs, ProgressBar } from '@/components/ui';
import { equipment, labour } from '@/data/mock';
import { Truck, Users } from 'lucide-react';

export function Resources() {
  const [tab, setTab] = useState('Equipment');

  return (
    <div>
      <PageHeader title="Equipment & Labour" subtitle="Resource availability and assignments" />
      <Tabs tabs={['Equipment', 'Labour']} active={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === 'Equipment' && (
          <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-steel-100 bg-steel-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Vehicle / Equipment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Availability</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Current Assignment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Next Available</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Condition</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((e, i) => (
                  <tr key={i} className="border-b border-steel-50 hover:bg-steel-50/50">
                    <td className="px-4 py-3 font-medium text-navy-900">{e.name}</td>
                    <td className="px-4 py-3 text-steel-500">{e.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.availability} /></td>
                    <td className="px-4 py-3 text-steel-600">{e.currentAssignment}</td>
                    <td className="px-4 py-3 text-steel-500">{e.nextAvailable}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.condition} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">
              {equipment.length} assets tracked
            </div>
          </div>
        )}

        {tab === 'Labour' && (
          <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-steel-100 bg-steel-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Employee / Team</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Trade</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Current Assignment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Availability</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase w-36">Utilisation</th>
                </tr>
              </thead>
              <tbody>
                {labour.map((l, i) => (
                  <tr key={i} className="border-b border-steel-50 hover:bg-steel-50/50">
                    <td className="px-4 py-3 font-medium text-navy-900">{l.name}</td>
                    <td className="px-4 py-3 text-steel-500">{l.trade}</td>
                    <td className="px-4 py-3 text-steel-600">{l.currentAssignment}</td>
                    <td className="px-4 py-3"><StatusBadge status={l.availability} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={l.utilisation} className="flex-1" />
                        <span className="text-xs text-steel-500 w-8 text-right">{l.utilisation}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">
              {labour.length} resources
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
