import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import {
    Database,
    UploadCloud,
    FileSpreadsheet,
    FileText,
    CheckCircle2,
    AlertCircle,
    Download,
    RefreshCw,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const DataTools = () => {
    const [importStep, setImportStep] = useState(1); // 1: Upload, 2: Validate, 3: Success
    const [fileName, setFileName] = useState('');
    const [isExportLoading, setIsExportLoading] = useState(false);

    // Mock handlers to advance the wizard UI
    const handleFileUpload = (e) => {
        // Prevent default form behavior if necessary, or just mock click
        e.preventDefault();
        setFileName('legacy_customer_database.xlsx');
        setTimeout(() => setImportStep(2), 800);
    };

    const handleValidationApprove = () => {
        setImportStep(3);
    };

    const handleImportReset = () => {
        setImportStep(1);
        setFileName('');
    };

    const handleExportMock = () => {
        setIsExportLoading(true);
        setTimeout(() => setIsExportLoading(false), 1500);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Database className="w-7 h-7 text-accent" />
                        Data Tools
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Bulk manage system records via Excel/CSV imports and exports.</p>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column: IMPORT PIPELINE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[500px]">
                    <div className="p-6 lg:p-8 flex-1 flex flex-col">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                            Import Wizard
                            {importStep > 1 && (
                                <button onClick={handleImportReset} className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1">
                                    <RefreshCw className="w-3.5 h-3.5" /> Start Over
                                </button>
                            )}
                        </h2>

                        {/* STEP 1: UPLOAD */}
                        {importStep === 1 && (
                            <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">1</div>
                                    <div className="h-0.5 flex-1 bg-gray-100"></div>
                                    <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">2</div>
                                    <div className="h-0.5 flex-1 bg-gray-100"></div>
                                    <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">3</div>
                                </div>

                                <div 
                                    className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-10 text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
                                    onClick={handleFileUpload}
                                >
                                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-8 h-8 text-accent" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Click or drag file to this area to upload</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mb-6">
                                        Support for a single or bulk upload. Strictly use the accepted template formats.
                                    </p>
                                    
                                    <div className="flex items-center gap-3 text-xs font-medium text-gray-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> .XLSX</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> .CSV</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button variant="outline" className="text-sm border-gray-200 text-gray-600">Download Empty Template</Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: VALIDATE */}
                        {importStep === 2 && (
                            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-8 w-8 rounded-full bg-success text-white flex items-center justify-center font-bold text-sm"><CheckCircle2 className="w-4 h-4" /></div>
                                    <div className="h-0.5 flex-1 bg-success"></div>
                                    <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">2</div>
                                    <div className="h-0.5 flex-1 bg-gray-100"></div>
                                    <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">3</div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{fileName}</p>
                                            <p className="text-xs text-gray-500">24 rows detected • 2 formatting issues</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center text-danger bg-danger/10 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-danger/20">Review Needed</span>
                                    </div>
                                </div>

                                {/* Mock Validation Table */}
                                <div className="border border-gray-200 rounded-xl overflow-x-auto shadow-sm flex-1 max-h-[250px] overflow-y-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50 sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-gray-500 font-medium">Row</th>
                                                <th className="px-4 py-3 text-gray-500 font-medium">Customer Name</th>
                                                <th className="px-4 py-3 text-gray-500 font-medium">Email Address</th>
                                                <th className="px-4 py-3 text-gray-500 font-medium text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">2</td>
                                                <td className="px-4 py-3 text-gray-900 font-medium">Riverwood Church</td>
                                                <td className="px-4 py-3 text-gray-600">office@riverwood.org</td>
                                                <td className="px-4 py-3 text-right"><CheckCircle2 className="w-4 h-4 text-success inline-block" /></td>
                                            </tr>
                                            <tr className="bg-danger/5 hover:bg-danger/10 border-l-2 border-l-danger">
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">3</td>
                                                <td className="px-4 py-3 text-gray-900 font-medium">Sarah Jenkins</td>
                                                <td className="px-4 py-3 text-danger font-bold relative group cursor-help">
                                                    N/A
                                                    <div className="absolute left-1/2 -top-10 -translate-x-1/2 hidden group-hover:block w-32 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg z-20 text-center">
                                                        Email is a required field.
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right"><AlertCircle className="w-4 h-4 text-danger inline-block" /></td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">4</td>
                                                <td className="px-4 py-3 text-gray-900 font-medium">Tech Solutions Inc</td>
                                                <td className="px-4 py-3 text-gray-600">billing@techsol.com</td>
                                                <td className="px-4 py-3 text-right"><CheckCircle2 className="w-4 h-4 text-success inline-block" /></td>
                                            </tr>
                                            <tr className="bg-warning/10 hover:bg-warning/20 border-l-2 border-l-warning">
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">5</td>
                                                <td className="px-4 py-3 text-gray-900 font-medium">Tech Solutions Inc</td>
                                                <td className="px-4 py-3 text-warning font-bold">billing@techsol.com</td>
                                                <td className="px-4 py-3 text-right"><AlertCircle className="w-4 h-4 text-warning inline-block" /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 mb-4">
                                    <span className="font-bold text-gray-900">Row 5 Warning:</span> This email address appears to be a duplicate of Row 4. It will be merged.
                                </div>

                                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                                    <Button variant="outline" onClick={handleImportReset}>Cancel Import</Button>
                                    <Button onClick={handleValidationApprove} className="flex items-center gap-2">
                                        Skip Errors & Import 22 Rows <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SUCCESS */}
                        {importStep === 3 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-12 h-12 text-success" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Import Complete</h3>
                                <p className="text-gray-500 max-w-sm mb-8">
                                    Successfully merged <span className="font-bold text-gray-900">22</span> new customer records into the system database. 2 records were skipped due to formatting errors.
                                </p>
                                <Button onClick={handleImportReset} variant="outline" className="shadow-sm">
                                    Start Another Import
                                </Button>
                            </div>
                        )}

                    </div>
                </div>

                {/* Right Column: EXPORT OPTIONS */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                    <div className="p-6 lg:p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Export Options</h2>
                        
                        <div className="space-y-4">
                            {/* Export Block 1 */}
                            <div className="p-5 border border-gray-200 rounded-2xl hover:border-accent/40 hover:shadow-md transition-all group flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div>
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        Customer Master List
                                        <span className="inline-flex items-center text-accent bg-accent/10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-accent/20">.CSV</span>
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Full extract of all CRM Contacts, Addresses, and Lifetime Totals.</p>
                                </div>
                                <Button 
                                    onClick={handleExportMock} 
                                    disabled={isExportLoading}
                                    variant="outline" 
                                    className="shrink-0 bg-white"
                                >
                                    {isExportLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                    {isExportLoading ? 'Processing...' : 'Export Data'}
                                </Button>
                            </div>

                            {/* Export Block 2 */}
                            <div className="p-5 border border-gray-200 rounded-2xl hover:border-accent/40 hover:shadow-md transition-all group flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="w-full sm:w-auto">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        Ad Order History
                                        <span className="inline-flex items-center text-success bg-success/10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-success/20">.XLSX</span>
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Line-by-line revenue details for financial reconciliation.</p>
                                    
                                    <div className="mt-3 grid grid-cols-2 gap-2 w-full max-w-sm">
                                        <select className="col-span-1 border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:border-accent">
                                            <option>2026 (YTD)</option>
                                            <option>2025</option>
                                            <option>2024</option>
                                        </select>
                                        <select className="col-span-1 border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:border-accent">
                                            <option>All Statuses</option>
                                            <option>Completed</option>
                                            <option>Active</option>
                                        </select>
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleExportMock} 
                                    disabled={isExportLoading}
                                    variant="outline" 
                                    className="shrink-0 bg-white self-start sm:self-center"
                                >
                                    {isExportLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                    {isExportLoading ? 'Processing...' : 'Export Data'}
                                </Button>
                            </div>
                            
                            {/* Export Block 3 */}
                            <div className="p-5 border border-gray-200 rounded-2xl hover:border-accent/40 hover:shadow-md transition-all group opacity-60">
                                <div>
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        Pricing Configuration
                                        <span className="inline-flex items-center text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-gray-200">.JSON</span>
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Export raw matrix multiplier values for developer API usage.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-accent/5 p-4 rounded-xl border border-accent/20 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                            <p className="text-sm text-accent leading-relaxed">
                                Exports containing more than 10,000 rows will be processed asynchronously and emailed to your account upon completion.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
