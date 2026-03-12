"use client";

import { useState, useMemo } from "react";
import { User, Check, X, Search, Plus } from "lucide-react";
import type { PatientShort } from "@/types/patientTypes";

type PatientAssignmentCompactProps = {
  patientList: PatientShort[] | null;
  currentPatient?: { display: string };
  isLoadingPatients: boolean;
  isAssigning: boolean;
  onAssign: (patientId: string) => Promise<void>;
};

export function PatientAssignmentCompact({
  patientList,
  currentPatient,
  isLoadingPatients,
  isAssigning,
  onAssign,
}: PatientAssignmentCompactProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientShort | null>(
    null,
  );

  //TODO - fire request to searchPatientsBySearchPhrase.
  const filteredPatients = useMemo(() => {
    if (!patientList || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return patientList.filter((patient) => {
      const fullName = `${(patient.name[0].given ?? []).join(" ")} ${
        patient.name[0].family
      }`.toLowerCase();
      return (
        fullName.includes(query) || patient.id.toLowerCase().includes(query)
      );
    });
  }, [patientList, searchQuery]);

  const handleSelectPatient = (patient: PatientShort) => {
    setSelectedPatient(patient);
  };

  const handleAssign = async () => {
    if (selectedPatient) {
      await onAssign(selectedPatient.id);
      setSelectedPatient(null);
      setSearchQuery("");
      setIsExpanded(false);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setSearchQuery("");
    setSelectedPatient(null);
  };

  const getPatientFullName = (patient: PatientShort) => {
    return `${(patient.name[0].given ?? []).join(" ")} ${
      patient.name[0].family
    }`;
  };

  const getInitials = (patient: PatientShort) => {
    const given = patient.name[0].given?.[0] || "";
    const family = patient.name[0].family || "";
    return `${given.charAt(0)}${family.charAt(0)}`.toUpperCase();
  };

  if (currentPatient) {
    return (
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-500/20 dark:to-green-500/20 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Assigned Patient
            </p>
            <p className="text-slate-900 dark:text-white font-medium">
              {currentPatient.display}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 hover:border-cyan-500/50 rounded-xl p-4 transition-all group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-lg border border-cyan-200 dark:border-cyan-500/30 group-hover:border-cyan-400/50 transition-colors">
            <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-left">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Patient Assignment
            </p>
            <p className="text-slate-900 dark:text-white font-medium">
              Click to assign patient
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-cyan-500/50 rounded-xl p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-lg border border-cyan-200 dark:border-cyan-500/30">
            <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-medium">
              Search for Patients
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Select and search users to assign device
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or ID..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
          autoFocus
        />
      </div>

      {/* Selected Patient Preview */}
      {selectedPatient && (
        <div className="bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-medium text-sm">
                {getInitials(selectedPatient)}
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-medium text-sm">
                  {getPatientFullName(selectedPatient)}
                </p>
                <p className="text-cyan-600 dark:text-cyan-400 text-xs">
                  ID: {selectedPatient.id}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery.trim() && !selectedPatient && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <User className="w-4 h-4" />
            <span>Search Results</span>
            {filteredPatients.length > 0 && (
              <span className="text-cyan-600 dark:text-cyan-400">
                ({filteredPatients.length})
              </span>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {isLoadingPatients ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-cyan-500 dark:border-t-cyan-400 rounded-full animate-spin mx-auto mb-2" />
                Loading patients...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                No patients found matching "{searchQuery}"
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full flex items-center justify-between p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/30 hover:border-cyan-500/30 rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium text-sm group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-500 group-hover:text-white transition-all">
                      {getInitials(patient)}
                    </div>
                    <div className="text-left">
                      <p className="text-slate-900 dark:text-white font-medium text-sm">
                        {getPatientFullName(patient)}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        ID: {patient.id}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/50">
        <button
          onClick={handleAssign}
          disabled={!selectedPatient || isAssigning}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
        >
          {isAssigning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Assign Patient
            </>
          )}
        </button>
        <button
          onClick={handleClose}
          disabled={isAssigning}
          className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
