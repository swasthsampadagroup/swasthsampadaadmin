import React, { useState } from 'react';
import {
  Target as TargetIcon,
  Award,
  TrendingUp,
  Calendar,
  Plus,
  Stethoscope,
  Pill,
  IndianRupee,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';

import { Target, Employee } from '../types';
import { Modal } from '../components/common/Modal';

interface TargetsProps {
  targets: Target[];
  employees: Employee[];
  onSaveTarget: (target: Partial<Target>) => Promise<Target>;
}

export const Targets: React.FC<TargetsProps> = ({
  targets,
  employees,
  onSaveTarget,
}) => {
  // ============================================================
  // MONTH / YEAR
  // ============================================================

  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState(2026);

  // ============================================================
  // MODAL STATE
  // ============================================================

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Target>>({});
  const [loading, setLoading] = useState(false);

  // ============================================================
  // MONTHS
  // ============================================================

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // ============================================================
  // FILTER TARGETS
  // ============================================================

  const filteredTargets = targets.filter(
    (t) =>
      t.month === selectedMonth &&
      t.year === selectedYear
  );

  // ============================================================
  // OPEN ADD TARGET MODAL
  // ============================================================

  const handleOpenAdd = () => {
    const firstEmp = employees[0];

    setFormData({
      employeeId: firstEmp?.id || '',
      employeeName: firstEmp?.name || '',
      hq: firstEmp?.hq || '',

      month: selectedMonth,
      year: selectedYear,

      // ========================================================
      // TARGET VALUES START FROM ZERO
      // ========================================================

      salesTarget: 0,
      salesAchieved: 0,

      doctorVisitTarget: 0,
      doctorVisitAchieved: 0,

      chemistVisitTarget: 0,
      chemistVisitAchieved: 0,

      // ========================================================
      // INCENTIVE
      // 2% OF SALES TARGET
      // ========================================================

      totalIncentive: 0,
      incentiveEarned: 0,

      status: 'In Progress',

      notes: '',
    });

    setIsModalOpen(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const handleCloseModal = () => {
    if (loading) return;

    setIsModalOpen(false);
    setFormData({});
  };

  // ============================================================
  // EMPLOYEE CHANGE
  // ============================================================

  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(
      (employee) => employee.id === empId
    );

    if (!emp) return;

    setFormData((previous) => ({
      ...previous,

      employeeId: emp.id,
      employeeName: emp.name,
      hq: emp.hq,
    }));
  };

  // ============================================================
  // SALES TARGET CHANGE
  //
  // Incentive = Sales Target × 2%
  // ============================================================

  const handleSalesTargetChange = (
    value: string
  ) => {
    const salesTarget = Number(value) || 0;

    const totalIncentive = Math.round(
      salesTarget * 0.02
    );

    setFormData((previous) => ({
      ...previous,

      salesTarget,
      totalIncentive,
    }));
  };

  // ============================================================
  // SUBMIT TARGET
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      const salesTarget =
        Number(formData.salesTarget) || 0;

      // ========================================================
      // ALWAYS CALCULATE INCENTIVE FROM SALES TARGET
      // 2%
      // ========================================================

      const totalIncentive = Math.round(
        salesTarget * 0.02
      );

      const finalTarget: Partial<Target> = {
        ...formData,

        employeeId: formData.employeeId || '',
        employeeName: formData.employeeName || '',
        hq: formData.hq || '',

        month: formData.month || selectedMonth,
        year: Number(formData.year) || selectedYear,

        salesTarget,
        salesAchieved:
          Number(formData.salesAchieved) || 0,

        doctorVisitTarget:
          Number(formData.doctorVisitTarget) || 0,

        doctorVisitAchieved:
          Number(formData.doctorVisitAchieved) || 0,

        chemistVisitTarget:
          Number(formData.chemistVisitTarget) || 0,

        chemistVisitAchieved:
          Number(formData.chemistVisitAchieved) || 0,

        // ======================================================
        // INCENTIVE IS ALWAYS 2%
        // ======================================================

        totalIncentive,

        incentiveEarned:
          Number(formData.incentiveEarned) || 0,

        status: 'In Progress',

        notes: formData.notes || '',
      };

      await onSaveTarget(finalTarget);

      setIsModalOpen(false);
      setFormData({});
    } catch (error) {
      console.error(
        'Error saving target:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // OVERVIEW CALCULATIONS
  // ============================================================

  const totalSalesTarget =
    filteredTargets.reduce(
      (sum, target) =>
        sum + (Number(target.salesTarget) || 0),
      0
    );

  const totalSalesAchieved =
    filteredTargets.reduce(
      (sum, target) =>
        sum + (Number(target.salesAchieved) || 0),
      0
    );

  const totalIncentivePool =
    filteredTargets.reduce(
      (sum, target) =>
        sum + (Number(target.totalIncentive) || 0),
      0
    );

  const totalIncentiveDisbursed =
    filteredTargets.reduce(
      (sum, target) =>
        sum + (Number(target.incentiveEarned) || 0),
      0
    );

  const overallSalesPercentage =
    totalSalesTarget > 0
      ? Math.round(
          (totalSalesAchieved /
            totalSalesTarget) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">

        <div>

          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">

            <TargetIcon className="w-5 h-5 text-[#005B96]" />

            <span>
              Targets & Field Performance Incentives
            </span>

            <span className="text-xs font-semibold bg-blue-100 text-[#005B96] px-2.5 py-0.5 rounded-full">
              {filteredTargets.length} Assigned Goals
            </span>

          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Doctor calling goals, chemist visit quotas,
            monthly sales targets and performance incentives
          </p>

        </div>

        {/* ================================================== */}
        {/* FILTER + ADD */}
        {/* ================================================== */}

        <div className="flex items-center gap-2.5 flex-wrap">

          {/* Month */}

          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value)
            }
            className="py-2 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
          >
            {months.map((month) => (
              <option
                key={month}
                value={month}
              >
                {month} {selectedYear}
              </option>
            ))}
          </select>

          {/* Year */}

          <input
            type="number"
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(
                Number(e.target.value)
              )
            }
            className="w-24 py-2 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
          />

          {/* Add Target */}

          <button
            id="targets-assign-new-btn"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#005B96] hover:bg-[#004875] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />

            <span>
              Set Target
            </span>
          </button>

        </div>

      </div>

      {/* ====================================================== */}
      {/* OVERVIEW CARDS */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* SALES TARGET */}

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">

          <div className="flex items-center justify-between">

            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Sales Target
            </p>

            <TrendingUp className="w-4 h-4 text-[#005B96]" />

          </div>

          <p className="text-2xl font-black text-slate-900 mt-1">
            ₹{totalSalesTarget.toLocaleString('en-IN')}
          </p>

          <p className="text-[11px] text-slate-400 mt-1">
            {selectedMonth} {selectedYear} Target
          </p>

        </div>

        {/* ACHIEVED */}

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">

          <div className="flex items-center justify-between">

            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Achieved Revenue
            </p>

            <CheckCircle2 className="w-4 h-4 text-emerald-600" />

          </div>

          <p className="text-2xl font-black text-emerald-600 mt-1">
            ₹{totalSalesAchieved.toLocaleString('en-IN')}
          </p>

          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {overallSalesPercentage}% of Target
          </p>

        </div>

        {/* INCENTIVE POOL */}

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">

          <div className="flex items-center justify-between">

            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Incentive Pool
            </p>

            <Award className="w-4 h-4 text-[#005B96]" />

          </div>

          <p className="text-2xl font-black text-[#005B96] mt-1">
            ₹{totalIncentivePool.toLocaleString('en-IN')}
          </p>

          <p className="text-[11px] text-slate-400 mt-1">
            Automatically calculated at 2%
          </p>

        </div>

        {/* DISBURSED */}

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs">

          <div className="flex items-center justify-between">

            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Incentive Qualified
            </p>

            <IndianRupee className="w-4 h-4 text-indigo-600" />

          </div>

          <p className="text-2xl font-black text-indigo-600 mt-1">
            ₹{totalIncentiveDisbursed.toLocaleString('en-IN')}
          </p>

          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            Based on achievement
          </p>

        </div>

      </div>

      {/* ====================================================== */}
      {/* TARGET CARDS */}
      {/* ====================================================== */}

      {filteredTargets.length === 0 ? (

        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">

            <TargetIcon className="w-7 h-7 text-slate-400" />

          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-800">
            No targets assigned
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            No targets are available for {selectedMonth}{' '}
            {selectedYear}.
          </p>

          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#005B96] hover:bg-[#004875] text-white text-xs font-bold rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Set First Target
          </button>

        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredTargets.map((target) => {

            const salesTarget =
              Number(target.salesTarget) || 0;

            const salesAchieved =
              Number(target.salesAchieved) || 0;

            const doctorTarget =
              Number(target.doctorVisitTarget) || 0;

            const doctorAchieved =
              Number(target.doctorVisitAchieved) || 0;

            const chemistTarget =
              Number(target.chemistVisitTarget) || 0;

            const chemistAchieved =
              Number(target.chemistVisitAchieved) || 0;

            const incentive =
              Number(target.totalIncentive) || 0;

            const incentiveEarned =
              Number(target.incentiveEarned) || 0;

            const salesPct =
              salesTarget > 0
                ? Math.min(
                    100,
                    Math.round(
                      (salesAchieved /
                        salesTarget) *
                        100
                    )
                  )
                : 0;

            const doctorPct =
              doctorTarget > 0
                ? Math.min(
                    100,
                    Math.round(
                      (doctorAchieved /
                        doctorTarget) *
                        100
                    )
                  )
                : 0;

            const chemPct =
              chemistTarget > 0
                ? Math.min(
                    100,
                    Math.round(
                      (chemistAchieved /
                        chemistTarget) *
                        100
                    )
                  )
                : 0;

            const isAchieved =
              salesTarget > 0 &&
              salesPct >= 100;

            return (

              <div
                key={target.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
              >

                {/* ========================================== */}
                {/* CARD HEADER */}
                {/* ========================================== */}

                <div className="flex items-start justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">

                        <User className="w-4 h-4 text-[#005B96]" />

                      </div>

                      <div>

                        <h3 className="font-bold text-slate-900 text-sm">
                          {target.employeeName || 'Employee'}
                        </h3>

                        <p className="text-xs text-[#005B96] font-medium">
                          {target.hq || 'HQ not assigned'}
                        </p>

                      </div>

                    </div>

                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isAchieved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isAchieved
                      ? 'Target Achieved'
                      : 'In Progress'}
                  </span>

                </div>

                {/* ========================================== */}
                {/* SALES TARGET */}
                {/* ========================================== */}

                <div className="space-y-1.5">

                  <div className="flex justify-between text-xs font-semibold">

                    <span className="text-slate-700 flex items-center gap-1">

                      <IndianRupee className="w-3.5 h-3.5 text-[#005B96]" />

                      Sales Target

                    </span>

                    <span className="font-bold text-[#005B96]">
                      {salesPct}%
                    </span>

                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">

                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAchieved
                          ? 'bg-emerald-500'
                          : 'bg-[#005B96]'
                      }`}
                      style={{
                        width: `${salesPct}%`,
                      }}
                    />

                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">

                    <span>
                      ₹
                      {salesAchieved.toLocaleString(
                        'en-IN'
                      )}{' '}
                      achieved
                    </span>

                    <span>
                      Target: ₹
                      {salesTarget.toLocaleString(
                        'en-IN'
                      )}
                    </span>

                  </div>

                </div>

                {/* ========================================== */}
                {/* DOCTOR / CHEMIST */}
                {/* ========================================== */}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">

                  {/* DOCTOR */}

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">

                    <div className="flex items-center gap-1 text-slate-500 font-medium text-[10px] mb-1">

                      <Stethoscope className="w-3 h-3 text-[#005B96]" />

                      <span>
                        Doctor Calls
                      </span>

                    </div>

                    <p className="font-bold text-slate-800">
                      {doctorAchieved} / {doctorTarget}
                    </p>

                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {doctorPct}% Done
                    </span>

                  </div>

                  {/* CHEMIST */}

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">

                    <div className="flex items-center gap-1 text-slate-500 font-medium text-[10px] mb-1">

                      <Pill className="w-3 h-3 text-cyan-600" />

                      <span>
                        Chemist Calls
                      </span>

                    </div>

                    <p className="font-bold text-slate-800">
                      {chemistAchieved} / {chemistTarget}
                    </p>

                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {chemPct}% Done
                    </span>

                  </div>

                </div>

                {/* ========================================== */}
                {/* INCENTIVE */}
                {/* ========================================== */}

                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-1.5 text-[#005B96] font-semibold">

                      <Award className="w-4 h-4" />

                      <span>
                        Incentive 2%
                      </span>

                    </div>

                    <span className="font-bold font-mono text-emerald-700">
                      ₹
                      {incentiveEarned.toLocaleString(
                        'en-IN'
                      )}{' '}
                      / ₹
                      {incentive.toLocaleString(
                        'en-IN'
                      )}
                    </span>

                  </div>

                  <p className="text-[10px] text-slate-500 mt-1">
                    Maximum incentive = 2% of sales target
                  </p>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* ====================================================== */}
      {/* ADD TARGET MODAL */}
      {/* ====================================================== */}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Set Sales & Field Target"
        subtitle="Assign monthly quotas and the incentive will automatically be calculated at 2% of the sales target."
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="target-form"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#005B96] hover:bg-[#004875] rounded-lg shadow-xs disabled:opacity-50"
            >
              {loading
                ? 'Saving...'
                : 'Save Target'}
            </button>
          </>
        }
      >

        <form
          id="target-form"
          onSubmit={handleSubmit}
          className="space-y-3.5 text-xs"
        >

          {/* ============================================== */}
          {/* EMPLOYEE */}
          {/* ============================================== */}

          <div>

            <label className="block font-bold text-slate-700 mb-1">
              Select Employee / MR *
            </label>

            <select
              value={formData.employeeId || ''}
              onChange={(e) =>
                handleEmployeeChange(
                  e.target.value
                )
              }
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold"
            >

              <option value="" disabled>
                Select employee
              </option>

              {employees.map((employee) => (

                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.name}
                  {employee.employeeId
                    ? ` (${employee.employeeId})`
                    : ''}
                  {employee.hq
                    ? ` - ${employee.hq}`
                    : ''}
                </option>

              ))}

            </select>

          </div>

          {/* ============================================== */}
          {/* MONTH / YEAR */}
          {/* ============================================== */}

          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="block font-bold text-slate-700 mb-1">
                Month *
              </label>

              <select
                value={
                  formData.month ||
                  selectedMonth
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    month: e.target.value,
                  })
                }
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              >

                {months.map((month) => (

                  <option
                    key={month}
                    value={month}
                  >
                    {month}
                  </option>

                ))}

              </select>

            </div>

            <div>

              <label className="block font-bold text-slate-700 mb-1">
                Year *
              </label>

              <input
                type="number"
                min="2020"
                max="2100"
                value={
                  formData.year ??
                  selectedYear
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: Number(
                      e.target.value
                    ),
                  })
                }
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-bold"
              />

            </div>

          </div>

          {/* ============================================== */}
          {/* SALES TARGET */}
          {/* ============================================== */}

          <div>

            <label className="block font-bold text-slate-700 mb-1">
              Monthly Gross Sales Target (₹) *
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={
                formData.salesTarget ?? 0
              }
              onChange={(e) =>
                handleSalesTargetChange(
                  e.target.value
                )
              }
              placeholder="Enter sales target"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-bold text-sm"
            />

            <p className="text-[10px] text-slate-500 mt-1">
              Enter the monthly sales target.
              Incentive is automatically calculated
              at 2%.
            </p>

          </div>

          {/* ============================================== */}
          {/* DOCTOR / CHEMIST TARGET */}
          {/* ============================================== */}

          <div className="grid grid-cols-2 gap-3">

            {/* DOCTOR */}

            <div>

              <label className="block font-bold text-slate-700 mb-1">
                Doctor Visit Target
              </label>

              <input
                type="number"
                min="0"
                value={
                  formData.doctorVisitTarget ??
                  0
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    doctorVisitTarget:
                      Number(
                        e.target.value
                      ) || 0,
                  })
                }
                placeholder="Enter target"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold"
              />

            </div>

            {/* CHEMIST */}

            <div>

              <label className="block font-bold text-slate-700 mb-1">
                Chemist Visit Target
              </label>

              <input
                type="number"
                min="0"
                value={
                  formData.chemistVisitTarget ??
                  0
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chemistVisitTarget:
                      Number(
                        e.target.value
                      ) || 0,
                  })
                }
                placeholder="Enter target"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold"
              />

            </div>

          </div>

          {/* ============================================== */}
          {/* AUTOMATIC INCENTIVE */}
          {/* ============================================== */}

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">

            <div className="flex items-center justify-between">

              <div>

                <div className="flex items-center gap-1.5">

                  <Award className="w-4 h-4 text-emerald-700" />

                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    Total Incentive
                  </p>

                </div>

                <p className="text-[10px] text-emerald-700 mt-0.5">
                  Automatically calculated as 2%
                  of Sales Target
                </p>

              </div>

              <p className="text-lg font-black text-emerald-700">
                ₹
                {(
                  formData.totalIncentive ??
                  0
                ).toLocaleString('en-IN')}
              </p>

            </div>

            {/* CALCULATION */}

            <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center justify-between">

              <span className="text-[10px] text-emerald-700">
                Sales Target × 2%
              </span>

              <span className="text-[10px] font-bold text-emerald-800">
                ₹
                {(
                  Number(
                    formData.salesTarget
                  ) || 0
                ).toLocaleString(
                  'en-IN'
                )}{' '}
                × 2%
              </span>

            </div>

          </div>

          {/* ============================================== */}
          {/* INFORMATION */}
          {/* ============================================== */}

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">

            <div className="flex gap-2">

              <CheckCircle2 className="w-4 h-4 text-[#005B96] shrink-0 mt-0.5" />

              <div>

                <p className="text-[11px] font-bold text-[#005B96]">
                  Incentive Rule
                </p>

                <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">
                  The maximum incentive pool is
                  automatically fixed at 2% of the
                  assigned monthly sales target.
                  It cannot be manually changed.
                </p>

              </div>

            </div>

          </div>

        </form>

      </Modal>

    </div>
  );
};