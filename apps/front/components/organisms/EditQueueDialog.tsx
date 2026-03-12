import { useState } from "react";
import { X } from "lucide-react";

export interface QueueConfig {
  name: string;
  topic: string;
  pollInterval: number;
  partitions: number;
  consumerPerPartition: boolean;
  packProcessingTimeout: number;
  submitStrategy: {
    type: string;
    batchSize: number;
  };
  processingStrategy: {
    type: string;
    retries: number;
    failurePercentage: number;
    pauseBetweenRetries: number;
    maxPauseBetweenRetries: number;
  };
}

interface EditQueueDialogProps {
  isOpen: boolean;
  queue: QueueConfig | null;
  onClose: () => void;
  onSave: (queue: QueueConfig) => void;
}

export function EditQueueDialog({
  isOpen,
  queue,
  onClose,
  onSave,
}: EditQueueDialogProps) {
  const [formData, setFormData] = useState<QueueConfig>(
    queue || {
      name: "",
      topic: "",
      pollInterval: 25,
      partitions: 10,
      consumerPerPartition: true,
      packProcessingTimeout: 2000,
      submitStrategy: {
        type: "BURST",
        batchSize: 1000,
      },
      processingStrategy: {
        type: "SKIP_ALL_FAILURES",
        retries: 3,
        failurePercentage: 0,
        pauseBetweenRetries: 3,
        maxPauseBetweenRetries: 5,
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {queue ? "Edit Queue" : "Add Queue"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Settings */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Basic Settings
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="e.g., Main"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Topic*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="e.g., tb_rule_engine.main"
                  />
                </div>
              </div>
            </div>

            {/* Queue Configuration */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Queue Configuration
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Poll Interval (ms)
                  </label>
                  <input
                    type="number"
                    value={formData.pollInterval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pollInterval: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Partitions
                  </label>
                  <input
                    type="number"
                    value={formData.partitions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        partitions: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Pack Processing Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={formData.packProcessingTimeout}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        packProcessingTimeout: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consumerPerPartition}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          consumerPerPartition: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      Consumer Per Partition
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Strategy */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Submit Strategy
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.submitStrategy.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        submitStrategy: {
                          ...formData.submitStrategy,
                          type: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="BURST">Burst</option>
                    <option value="BATCH">Batch</option>
                    <option value="SEQUENTIAL_BY_ORIGINATOR">
                      Sequential by originator
                    </option>
                    <option value="SEQUENTIAL">Sequential</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    value={formData.submitStrategy.batchSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        submitStrategy: {
                          ...formData.submitStrategy,
                          batchSize: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Processing Strategy */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Processing Strategy
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.processingStrategy.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        processingStrategy: {
                          ...formData.processingStrategy,
                          type: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="SKIP_ALL_FAILURES">Skip all failures</option>
                    <option value="RETRY_ALL">Retry all</option>
                    <option value="RETRY_FAILED">Retry failed</option>
                    <option value="RETRY_TIMED_OUT">Retry timed out</option>
                    <option value="RETRY_FAILED_AND_TIMED_OUT">
                      Retry failed and timed out
                    </option>
                    <option value="SKIP_ALL_FAILURES_AND_TIMEOUTS">
                      Skip all failures and timeouts
                    </option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Retries
                    </label>
                    <input
                      type="number"
                      value={formData.processingStrategy.retries}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          processingStrategy: {
                            ...formData.processingStrategy,
                            retries: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Failure Percentage
                    </label>
                    <input
                      type="number"
                      value={formData.processingStrategy.failurePercentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          processingStrategy: {
                            ...formData.processingStrategy,
                            failurePercentage: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Pause Between Retries (sec)
                    </label>
                    <input
                      type="number"
                      value={formData.processingStrategy.pauseBetweenRetries}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          processingStrategy: {
                            ...formData.processingStrategy,
                            pauseBetweenRetries: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Max Pause Between Retries (sec)
                    </label>
                    <input
                      type="number"
                      value={formData.processingStrategy.maxPauseBetweenRetries}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          processingStrategy: {
                            ...formData.processingStrategy,
                            maxPauseBetweenRetries: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
