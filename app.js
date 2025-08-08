import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client'; // Import for React 18+
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// Custom Modal Component for info messages
const Modal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
      <p className="text-gray-800 text-lg mb-4">{message}</p>
      <button
        onClick={onClose}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
      >
        حسناً
      </button>
    </div>
  </div>
);

// Confirmation Modal Component for delete actions
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
      <p className="text-gray-800 text-lg mb-4">{message}</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onConfirm}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
        >
          تأكيد
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
        >
          إلغاء
        </button>
      </div>
    </div>
  </div>
);

// About Modal Component
const AboutModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm transform transition-all scale-100 opacity-100 text-center">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">عن التطبيق</h3>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
          هذا التطبيق تم تصميمه وتطويره بواسطة:
          <br />
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-xl">عبدالله الزمزمي</span>
        </p>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};

// Add Customer Modal Component
const AddCustomerModal = ({ show, onClose, onAddCustomer, newCustomerName, setNewCustomerName, initialDebtAmount, setInitialDebtAmount, initialDebtDescription, setInitialDebtDescription, isSubmitting }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all scale-100 opacity-100">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">إضافة عميل جديد</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="modalCustomerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم العميل</label>
            <input
              type="text"
              id="modalCustomerName"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 text-base"
              placeholder="أدخل اسم العميل"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="modalInitialDebtAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مبلغ الدين المبدئي (اختياري)</label>
            <input
              type="number"
              id="modalInitialDebtAmount"
              value={initialDebtAmount}
              onChange={(e) => setInitialDebtAmount(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 text-base"
              placeholder="أدخل مبلغ الدين المبدئي"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="modalInitialDebtDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف الدين المبدئي (اختياري)</label>
            <textarea
              id="modalInitialDebtDescription"
              value={initialDebtDescription}
              onChange={(e) => setInitialDebtDescription(e.target.value)}
              rows="2"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 text-base resize-none"
              placeholder="مثال: دين مبدئي عند التسجيل"
              disabled={isSubmitting}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              onClick={onAddCustomer}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Customer Name Modal Component
const EditCustomerNameModal = ({ show, onClose, onSave, currentName, setEditedName, isSubmitting }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all scale-100 opacity-100">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">تعديل اسم العميل</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="editCustomerNameInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الجديد</label>
            <input
              type="text"
              id="editCustomerNameInput"
              value={currentName}
              onChange={(e) => setEditedName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 text-base"
              placeholder="أدخل الاسم الجديد للعميل"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              onClick={onSave}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// Main Interface Component
const MainInterface = ({
  newCustomerName, setNewCustomerName,
  newPurchaseDetails, setNewPurchaseDetails,
  newPurchaseValue, setNewPurchaseValue,
  newNotes, setNewNotes,
  newTransactionType, setNewTransactionType,
  handleAddTransaction,
  setView,
  userId,
  showInfoModal,
  isSubmitting, // Pass isSubmitting prop
  customers, // Pass customers for suggestions
  setShowAboutModal // Pass function to show about modal
}) => (
  <div dir="rtl" className="p-4 flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md border border-gray-200">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">تسجيل معاملة جديدة</h2>
      <div className="mb-4">
        <label htmlFor="customerName" className="block text-gray-700 text-sm font-semibold mb-2">اسم العميل:</label>
        <input
          type="text"
          id="customerName"
          className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          value={newCustomerName}
          onChange={(e) => setNewCustomerName(e.target.value)}
          placeholder="أدخل اسم العميل"
          list="customer-names" // Link to datalist for suggestions
          disabled={isSubmitting} // Disable input during submission
        />
        <datalist id="customer-names">
          {customers.map(customer => (
            <option key={customer.id} value={customer.name} />
          ))}
        </datalist>
      </div>
      <div className="mb-4">
        <label htmlFor="purchaseDetails" className="block text-gray-700 text-sm font-semibold mb-2">التفاصيل:</label>
        <textarea
          id="purchaseDetails"
          className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 h-20 resize-none"
          value={newPurchaseDetails}
          onChange={(e) => setNewPurchaseDetails(e.target.value)}
          placeholder="مثال: 2 كجم أرز، 1 لتر زيت"
          disabled={isSubmitting} // Disable input during submission
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="purchaseValue" className="block text-gray-700 text-sm font-semibold mb-2">القيمة:</label>
        <input
          type="number"
          id="purchaseValue"
          className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          value={newPurchaseValue}
          onChange={(e) => setNewPurchaseValue(e.target.value)}
          placeholder="مثال: 50.75"
          disabled={isSubmitting} // Disable input during submission
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2">نوع المعاملة:</label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600 h-4 w-4"
              name="transactionType"
              value="purchase"
              checked={newTransactionType === 'purchase'}
              onChange={() => setNewTransactionType('purchase')}
              disabled={isSubmitting} // Disable radio during submission
            />
            <span className="ml-2 text-gray-700">شراء (إضافة دين)</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-green-600 h-4 w-4"
              name="transactionType"
              value="payment"
              checked={newTransactionType === 'payment'}
              onChange={() => setNewTransactionType('payment')}
              disabled={isSubmitting} // Disable radio during submission
            />
            <span className="ml-2 text-gray-700">دفع (خصم من الدين)</span>
          </label>
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="notes" className="block text-gray-700 text-sm font-semibold mb-2">ملاحظات (اختياري):</label>
        <input
          type="text"
          id="notes"
          className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          placeholder="أضف أي ملاحظات إضافية"
          disabled={isSubmitting} // Disable input during submission
        />
      </div>
      <button
        onClick={() => handleAddTransaction()}
        className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transform hover:scale-105 transition duration-300 ease-in-out shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isSubmitting} // Disable button during submission
      >
        {isSubmitting ? 'جاري الإرسال...' : 'إرسال المعاملة'}
      </button>
      <button
        onClick={() => setView('customerList')}
        className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transform hover:scale-105 transition duration-300 ease-in-out shadow-md"
        disabled={isSubmitting} // Disable button during submission
      >
        قائمة العملاء
      </button>
    </div>
    {userId && (
      <div className="mt-6 text-center text-gray-600 text-sm">
        معرف المستخدم الخاص بك: <span className="font-mono text-gray-800">{userId}</span>
      </div>
    )}
    <button
      onClick={() => setShowAboutModal(true)}
      className="mt-4 text-gray-500 hover:text-gray-700 text-sm underline transition duration-200"
      disabled={isSubmitting}
    >
      عن التطبيق والمصمم
    </button>
  </div>
);

// Customer List Interface Component
const CustomerListInterface = ({
  setView,
  searchTerm, setSearchTerm,
  customers,
  handleSelectCustomer,
  handleDeleteCustomer,
  showInfoModal,
  setShowAddCustomerModal, // New prop for showing add customer modal
  isSubmitting // Pass isSubmitting prop
}) => (
  <div dir="rtl" className="p-4 flex flex-col items-center min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md border border-gray-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <button onClick={() => setView('main')} className="text-gray-600 hover:text-gray-800 transition duration-200" disabled={isSubmitting}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">العملاء</h2>
        <button
          onClick={() => setShowAddCustomerModal(true)} // New button to add customer
          className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transform hover:scale-105 transition duration-300 ease-in-out shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting} // Disable button during submission
        >
          إضافة عميل
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          placeholder="ابحث عن عميل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isSubmitting} // Disable input during submission
        />
      </div>

      {customers.length === 0 ? (
        <p className="text-center text-gray-500 py-8">لا يوجد عملاء مسجلين أو لا توجد نتائج للبحث.</p>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {customers.map((customer) => (
            <li
              key={customer.id}
              className="flex items-center justify-between bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 hover:bg-blue-50 transition duration-200 cursor-pointer"
              onClick={() => handleSelectCustomer(customer)}
            >
              <span className="text-base sm:text-lg font-medium text-gray-800">{customer.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }}
                className="p-1 sm:p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-200"
                title="حذف العميل"
                disabled={isSubmitting} // Disable button during submission
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

// Customer Detail Interface Component
const CustomerDetailInterface = ({
  setView,
  selectedCustomer,
  filterStartDate, setFilterStartDate,
  filterEndDate, setFilterEndDate,
  filteredTransactions,
  editingTransactionId, setEditingTransactionId,
  editPurchaseDetails, setEditPurchaseDetails,
  editPurchaseValue, setEditPurchaseValue,
  startEditingTransaction, saveEditedTransaction, handleDeleteTransaction,
  calculateTotalDebt,
  handleExport,
  newPurchaseDetails, setNewPurchaseDetails,
  newPurchaseValue, setNewPurchaseValue,
  newTransactionType, setNewTransactionType,
  handleAddTransaction,
  showInfoModal,
  setShowEditCustomerNameModal, // New prop for showing edit customer name modal
  isSubmitting // Pass isSubmitting prop
}) => (
  <div dir="rtl" className="p-4 flex flex-col items-center min-h-screen bg-gradient-to-br from-yellow-50 to-green-100">
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md border border-gray-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <button onClick={() => setView('customerList')} className="text-gray-600 hover:text-gray-800 transition duration-200" disabled={isSubmitting}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{selectedCustomer?.name || 'العميل'}</h2>
        <button
          onClick={() => setShowEditCustomerNameModal(true)} // New button to edit customer name
          className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transform hover:scale-105 transition duration-300 ease-in-out shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting} // Disable button during submission
        >
          تعديل الاسم
        </button>
      </div>

      {/* Date Filter */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg shadow-inner">
        <label className="block text-gray-700 text-sm font-semibold mb-2">تصفية حسب التاريخ:</label>
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          <input
            type="date"
            className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            title="من تاريخ"
            disabled={isSubmitting} // Disable input during submission
          />
          <input
            type="date"
            className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            title="إلى تاريخ"
            disabled={isSubmitting} // Disable input during submission
          />
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="text-center text-gray-500 py-8">لا توجد معاملات لهذا العميل أو لا توجد نتائج للتصفية.</p>
      ) : (
        <div className="flex flex-col space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`p-4 rounded-lg shadow-sm border relative ${
                transaction.type === 'payment' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'
              }`}
            >
              {editingTransactionId === transaction.id ? (
                // Edit mode for transaction
                <div className="flex flex-col space-y-2">
                  <input
                    type="text"
                    className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={editPurchaseDetails}
                    onChange={(e) => setEditPurchaseDetails(e.target.value)}
                    placeholder="تفاصيل المشتريات"
                    disabled={isSubmitting} // Disable input during submission
                  />
                  <input
                    type="number"
                    className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={editPurchaseValue}
                    onChange={(e) => setEditPurchaseValue(e.target.value)}
                    placeholder="القيمة"
                    disabled={isSubmitting} // Disable input during submission
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => saveEditedTransaction(transaction.id)}
                      className={`bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-lg transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isSubmitting} // Disable button during submission
                    >
                      {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                    <button
                      onClick={() => setEditingTransactionId(null)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-bold py-2 px-3 rounded-lg transition duration-200"
                      disabled={isSubmitting} // Disable button during submission
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode for transaction
                <>
                  <p className="text-gray-800 font-semibold">{transaction.details}</p>
                  <p className={`font-bold text-lg mt-1 ${transaction.type === 'payment' ? 'text-green-700' : 'text-red-700'}`}>
                    {transaction.type === 'payment' ? 'دفع: ' : 'دين: '}
                    {transaction.value?.toFixed(2)}
                  </p>
                  {transaction.notes && <p className="text-gray-600 text-sm mt-1">ملاحظات: {transaction.notes}</p>}
                  <p className="text-gray-500 text-xs mt-2">
                    {transaction.timestamp ? new Date(transaction.timestamp.toDate()).toLocaleString('ar-EG') : 'جارٍ التحميل...'}
                  </p>
                  {/* Moved buttons to left-2 */}
                  <div className="absolute top-2 left-2 flex space-x-1 rtl:space-x-reverse">
                    <button
                      onClick={() => startEditingTransaction(transaction)}
                      className="p-1 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition duration-200"
                      title="تعديل"
                      disabled={isSubmitting} // Disable button during submission
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-200"
                      title="حذف"
                      disabled={isSubmitting} // Disable button during submission
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col space-y-3 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 w-full">
          <button
            onClick={calculateTotalDebt}
            className={`bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-3 rounded-lg focus:outline-none focus:shadow-outline transform hover:scale-105 transition duration-300 ease-in-out shadow-lg flex-shrink-0 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="حساب الإجمالي"
            disabled={isSubmitting} // Disable button during submission
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3 .895-3 2 1.343 2 3 2m0-8c1.11 0 2.08.402 2.592.895L17.75 4.25M4.25 17.75L6.408 19.908C6.92 20.401 7.89 20.895 9 20.895m0-16.79c-1.11 0-2.08-.402-2.592-.895L4.25 6.25m15.5 15.5L17.592 19.908C17.08 19.401 16.11 18.895 15 18.895m-1.11-16.79c1.11 0 2.08.402 2.592.895L19.75 6.25M6.25 4.25L4.25 6.25m15.5 15.5L17.75 19.75" />
            </svg>
          </button>
          <button
            onClick={() => handleExport('currentCustomerTransactions')}
            className={`bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-3 rounded-lg focus:outline-none focus:shadow-outline transform hover:scale-105 transition duration-300 ease-in-out shadow-lg flex-shrink-0 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="تصدير البيانات"
            disabled={isSubmitting} // Disable button during submission
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <div className="flex-grow">
            <input
              type="text"
              className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 mb-2"
              placeholder="تفاصيل المعاملة الجديدة"
              value={newPurchaseDetails}
              onChange={(e) => setNewPurchaseDetails(e.target.value)}
              disabled={isSubmitting} // Disable input during submission
            />
            <input
              type="number"
              className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
              placeholder="قيمة المعاملة الجديدة"
              value={newPurchaseValue}
              onChange={(e) => setNewPurchaseValue(e.target.value)}
              disabled={isSubmitting} // Disable input during submission
            />
            <div className="flex space-x-4 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600 h-4 w-4"
                  name="newTransactionTypeDetail"
                  value="purchase"
                  checked={newTransactionType === 'purchase'}
                  onChange={() => setNewTransactionType('purchase')}
                  disabled={isSubmitting} // Disable radio during submission
                />
                <span className="ml-2 text-gray-700 text-sm">شراء</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-green-600 h-4 w-4"
                  name="newTransactionTypeDetail"
                  value="payment"
                  checked={newTransactionType === 'payment'}
                  onChange={() => setNewTransactionType('payment')}
                  disabled={isSubmitting} // Disable radio during submission
                />
                <span className="ml-2 text-gray-700 text-sm">دفع</span>
              </label>
            </div>
          </div>
          <button
            onClick={() => handleAddTransaction(selectedCustomer.id)}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg focus:outline-none focus:shadow-outline transform hover:scale-105 transition duration-300 ease-in-out shadow-lg flex-shrink-0 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="إضافة معاملة"
            disabled={isSubmitting} // Disable button during submission
          >
            {isSubmitting ? 'جاري الإضافة...' : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Main App component
const App = () => {
  // Firebase and Auth states
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Navigation and Data states
  const [view, setView] = useState('main'); // 'main', 'customerList', 'customerDetail'
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);

  // Modal states for user feedback
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteConfirmAction, setDeleteConfirmAction] = useState(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false); // New state for add customer modal
  const [showEditCustomerNameModal, setShowEditCustomerNameModal] = useState(false); // New state for edit customer name modal
  const [showAboutModal, setShowAboutModal] = useState(false); // New state for about modal

  // Input states for main interface and new transactions
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPurchaseDetails, setNewPurchaseDetails] = useState('');
  const [newPurchaseValue, setNewPurchaseValue] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newTransactionType, setNewTransactionType] = useState('purchase'); // 'purchase' or 'payment'

  // Input states for Add Customer Modal
  const [addCustomerModalName, setAddCustomerModalName] = useState('');
  const [addCustomerModalInitialDebtAmount, setAddCustomerModalInitialDebtAmount] = useState('');
  const [addCustomerModalInitialDebtDescription, setAddCustomerModalInitialDebtDescription] = useState('');

  // Input states for editing transactions
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editPurchaseDetails, setEditPurchaseDetails] = useState('');
  const [editPurchaseValue, setEditPurchaseValue] = useState('');

  // Input states for Edit Customer Name Modal
  const [editedCustomerName, setEditedCustomerName] = useState('');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // State to manage submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Firebase and handle authentication
  useEffect(() => {
    try {
      // For Firebase Hosting, replace these placeholders with your actual Firebase project configuration.
      // You can find these details in your Firebase project settings -> Project settings -> General -> Your apps.
      const firebaseConfig = {
        apiKey: "YOUR_API_KEY", // Example: "AIzaSyC..."
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Example: "your-project-id.firebaseapp.com"
        projectId: "YOUR_PROJECT_ID", // Example: "your-project-id"
        storageBucket: "YOUR_PROJECT_ID.appspot.com", // Example: "your-project-id.appspot.com"
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Example: "1234567890"
        appId: "YOUR_APP_ID_FROM_FIREBASE_CONSOLE" // Example: "1:234567890:web:abcdef1234567890abcdef"
      };

      // The `appId` used in Firestore paths should ideally match your Firebase project ID
      // or a specific ID you've configured in your Firestore Security Rules.
      // For this example, we'll use the projectId from firebaseConfig as the appId for Firestore paths.
      const appId = firebaseConfig.projectId;

      // In a Firebase Hosting setup, __initial_auth_token is not automatically available.
      // If you are using custom token authentication, you would fetch this token from your backend.
      // For anonymous sign-in, you can leave it as null.
      const initialAuthToken = null;

      if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !appId) {
        console.error("Firebase config is incomplete or appId is missing. Please fill in your Firebase project details.");
        showInfoModal("خطأ في تهيئة Firebase. يرجى ملء تفاصيل مشروعك في ملف app.js.");
        return;
      }

      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
          setIsAuthReady(true);
          console.log("Firebase user authenticated:", user.uid);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
              console.log("Signed in with custom token.");
            } else {
              await signInAnonymously(firebaseAuth);
              console.log("Signed in anonymously.");
            }
          } catch (error) {
            console.error("Error during authentication:", error);
            showInfoModal(`خطأ في تسجيل الدخول: ${error.message}`);
          }
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      showInfoModal(`خطأ فادح في تهيئة التطبيق: ${error.message}`);
    }
  }, []); // Empty dependency array means this effect runs once on mount

  // Fetch customers when auth is ready
  useEffect(() => {
    if (db && userId && isAuthReady) {
      // Ensure appId is derived consistently, e.g., from firebaseConfig.projectId
      const firebaseConfig = { projectId: "YOUR_PROJECT_ID" }; // Placeholder, replace with actual config
      const appId = firebaseConfig.projectId; // Use projectId as appId for Firestore path

      const customersCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/customers`);

      const unsubscribe = onSnapshot(customersCollectionRef, (snapshot) => {
        const fetchedCustomers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomers(fetchedCustomers);
        console.log("Customers fetched:", fetchedCustomers);
      }, (error) => {
        console.error("Error fetching customers:", error);
        showInfoModal(`خطأ في جلب بيانات العملاء: ${error.message}`);
      });

      return () => unsubscribe();
    }
  }, [db, userId, isAuthReady]); // Dependencies: db, userId, isAuthReady

  // Fetch transactions for the selected customer
  useEffect(() => {
    if (db && userId && isAuthReady && selectedCustomer) {
      // Ensure appId is derived consistently
      const firebaseConfig = { projectId: "YOUR_PROJECT_ID" }; // Placeholder, replace with actual config
      const appId = firebaseConfig.projectId; // Use projectId as appId for Firestore path

      const transactionsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/customers/${selectedCustomer.id}/transactions`);

      const unsubscribe = onSnapshot(transactionsCollectionRef, (snapshot) => {
        const fetchedTransactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => a.timestamp?.toMillis() - b.timestamp?.toMillis()); // Sort by timestamp
        setCustomerTransactions(fetchedTransactions);
        console.log(`Transactions for ${selectedCustomer.name}:`, fetchedTransactions);
      }, (error) => {
        console.error(`Error fetching transactions for ${selectedCustomer.name}:`, error);
        showInfoModal(`خطأ في جلب معاملات العميل: ${error.message}`);
      });

      return () => unsubscribe();
    } else {
      setCustomerTransactions([]); // Clear transactions if no customer is selected
    }
  }, [db, userId, isAuthReady, selectedCustomer]); // Dependencies: db, userId, isAuthReady, selectedCustomer

  // Utility function to show a custom modal message
  const showInfoModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Handle adding a new transaction (from main or detail view)
  const handleAddTransaction = async (customerId = null) => {
    if (!db || !userId || !isAuthReady) {
      showInfoModal("الرجاء الانتظار حتى يتم تهيئة التطبيق.");
      return;
    }
    if (isSubmitting) return; // Prevent duplicate submission

    setIsSubmitting(true); // Set submitting state to true

    if (!newPurchaseValue.trim() || isNaN(parseFloat(newPurchaseValue))) {
      showInfoModal("قيمة المعاملة يجب أن تكون رقمًا صالحًا.");
      setIsSubmitting(false);
      return;
    }

    // Conditionally check for details based on transaction type
    if (newTransactionType === 'purchase' && !newPurchaseDetails.trim()) {
      showInfoModal("الرجاء ملء حقول التفاصيل للمعاملات من نوع شراء.");
      setIsSubmitting(false);
      return;
    }

    if (!customerId && !newCustomerName.trim()) { // Only required for main view if customerId is not provided
      showInfoModal("الرجاء إدخال اسم العميل.");
      setIsSubmitting(false);
      return;
    }

    const parsedValue = parseFloat(newPurchaseValue);

    // Ensure appId is derived consistently
    const firebaseConfig = { projectId: "YOUR_PROJECT_ID" }; // Placeholder, replace with actual config
    const appId = firebaseConfig.projectId; // Use projectId as appId for Firestore path

    const customersCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/customers`);
    let targetCustomerId = customerId;

    try {
      if (!targetCustomerId) {
        // If no customerId provided, try to find or create customer
        const q = query(customersCollectionRef, where("name", "==", newCustomerName.trim()));
        const customerSnapshot = await getDocs(q);

        if (customerSnapshot.empty) {
          const newCustomerDoc = await addDoc(customersCollectionRef, {
            name: newCustomerName.trim(),
            createdAt: serverTimestamp(),
          });
          targetCustomerId = newCustomerDoc.id;
          showInfoModal(`تمت إضافة عميل جديد: ${newCustomerName.trim()}`);
        } else {
          targetCustomerId = customerSnapshot.docs[0].id;
        }
      }

      // Add the transaction to the customer's subcollection
      const transactionsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/customers/${targetCustomerId}/transactions`);
      await addDoc(transactionsCollectionRef, {
        details: newPurchaseDetails.trim(), // Will be empty string if not required for payment
        value: parsedValue,
        notes: newNotes.trim(),
        type: newTransactionType, // 'purchase' or 'payment'
        timestamp: serverTimestamp(),
      });

      showInfoModal("تمت إضافة المعاملة بنجاح!");
      // Clear form fields
      setNewCustomerName('');
      setNewPurchaseDetails('');
      setNewPurchaseValue('');
      setNewNotes('');
      setNewTransactionType('purchase'); // Reset to default
    } catch (error) {
      console.error("Error adding transaction:", error);
      showInfoModal(`خطأ في إضافة المعاملة: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Handle adding a new customer from the "Add Customer" modal
  const handleAddCustomerFromModal = async () => {
    if (!db || !userId || !isAuthReady) {
      showInfoModal("الرجاء الانتظار حتى يتم تهيئة التطبيق.");
      return;
    }
    if (isSubmitting) return; // Prevent duplicate submission

    if (!addCustomerModalName.trim()) {
      showInfoModal("الرجاء إدخال اسم العميل.");
      return;
    }

    setIsSubmitting(true); // Set submitting state to true

    // Ensure appId is derived consistently
    const firebaseConfig = { projectId: "YOUR_PROJECT_ID" }; // Placeholder, replace with actual config
    const appId = firebaseConfig.projectId; // Use projectId as appId for Firestore path

    const customersCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/customers`);

    try {
      // Check if customer already exists
      const q = query(customersCollectionRef, where("name", "==", addCustomerModalName.trim()));
      const customerSnapshot = await getDocs(q);

      if (!customerSnapshot.empty) {
        showInfoModal("عميل بهذا الاسم موجود بالفعل. يرجى اختيار اسم آخر.");
        setIsSubmitting(false); // Reset submitting state before returning
        return; // Stop execution if duplicate
      }

      const newCustomerDoc = await addDoc(customersCollectionRef, {
        name: addCustomerModalName.trim(),
        createdAt: serverTimestamp(),
      });

      // Add initial debt if provided
      if (addCustomerModalInitialDebtAmount.trim() && !isNaN(parseFloat(addCustomerModalInitialDebtAmount))) {
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/customers/${newCustomerDoc.id}/transactions`), {
          details: addCustomerModalInitialDebtDescription.trim() || 'دين مبدئي عند التسجيل',
          value: parseFloat(addCustomerModalInitialDebtAmount),
          notes: '',
          type: 'purchase',
          timestamp: serverTimestamp(),
        });
      }

      showInfoModal(`تمت إضافة العميل ${addCustomerModalName.trim()} بنجاح!`);
      setAddCustomerModalName('');
      setAddCustomerModalInitialDebtAmount('');
      setAddCustomerModalInitialDebtDescription('');
      setShowAddCustomerModal(false);
    } catch (error) {
      console.error("Error adding customer from modal:", error);
      showInfoModal(`خطأ في إضافة العميل: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };


  // Navigate to customer detail view
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setView('customerDetail');
    // Reset filters when navigating to a new customer
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // Delete a customer and all their transactions
  const handleDeleteCustomer = async (customerIdToDelete) => {
    if (!db || !userId || !isAuthReady) {
      showInfoModal("الرجاء الانتظار حتى يتم تهيئة التطبيق.");
      return;
    }
    if (isSubmitting) return; // Prevent duplicate submission

    // Ensure appId is derived consistently
    const firebaseConfig = { projectId: "YOUR_PROJECT_ID" }; // Placeholder, replace with actual config
    const appId = firebaseConfig.projectId; // Use projectId as appId for Firestore path

    const customerDocRef = doc(db, `artifacts/${appId}/users/${userId}/customers/${customerIdToDelete}`);

    setDeleteConfirmAction(() => async () => {
      setIsSubmitting(true); // Set submitting state
      try {
        const transactionsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/customers/${customerIdToDelete}/transactions`);
        const transactionDocs = await getDocs(transactionsCollectionRef);
        const deletePromises = transactionDocs.docs.map(tDoc => deleteDoc(tDoc.ref));
        await Promise.all(deletePromises);

        await deleteDoc(customerDocRef);
        showInfoModal("تم حذف العميل وجميع معاملاته بنجاح.");
        if (selectedCustomer && selectedCustomer.id === customerIdToDelete) {
          setSelectedCustomer(null);
          setView('customerList');
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        showInfoModal(`خطأ في حذف العميل: ${error.message}`);
      } finally {
        setShowDeleteConfirmModal(false);
        setDeleteConfirmAction(null);
        setIsSubmitting(false); // Reset submitting state
      }
    });
    setShowDeleteConfirmModal(true);
    setModalMessage("هل أنت متأكد أنك تريد حذف هذا العميل وجميع معاملاته؟ هذا الإجراء لا يمكن التراجع عنه.");
  };

  // Start editing a specific transaction
  const startEditingTransaction = (transaction) => {
    setEditingTransactionId(transaction.id);
    setEditPurchaseDetails(transaction.details);
    setEditPurchaseValue(transaction.value.toString());
  };

  // Save changes to an edited transaction
  const saveEditedTransaction = async (transactionId) => {
    if (!db || !userId || !isAuthReady || !selectedCustomer) {
      showInfoModal("الرجاء الانتظار حتى يتم تهيئة التطبيق.");
      return;
    }
    if (isSubmitting) return; // Prevent duplicate submission

    if (!editPurchaseDetails.trim() || !editPurchaseValue.trim()) {
      showInfoModal("الرجاء ملء حقول التفاصيل والقيمة.");
      return;
    }

    const parsedValue = parseFloat(editPurchaseValue);
    if (isNaN(parsedValue)) {
      showInfoModal("قيمة المعاملة يجب أن تكون رقمًا صالحًا.");
      return;
    }

    setIsSubmitting(true); // Set submitting state

    // Ensure appId is derived consistently
    const firebaseConfig = { projectId: "YOUR_PROJECT_ID" }; // Placeholder, replace with actual config
    const appId = firebaseConfig.projectId; // Use projectId as appId for Firestore path

    const transactionDocRef = doc(db, `artifacts/${appId}/users/${userId}/customers/${selectedCustomer.id}/transactions/${transactionId}`);

    try {
      await updateDoc(transactionDocRef, {
        details: editPurchaseDetails.trim(),
        value: parsedValue,
      });
      showInfoModal("تم تحديث المعاملة بنجاح!");
      setEditingTransactionId(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
      showInfoModal(`خطأ في تحديث المعاملة: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Delete a specific transaction
  const handleDeleteTransaction = async (transactionId) => {
    if (!db || !userId || !isAuthReady || !selectedCustomer) {
      showInfoModal("الرجاء الانتظار حتى يتم تهيئة التطبيق.");
      return;
    }
    if (isSubmitting) return; // Prevent duplicate submission

    // Ensure appId is derived consistently
    const firebaseConfig = { projectId: "YOUR_PROJECT_ID" }; // Placeholder, replace with actual config
    const appId = firebaseConfig.projectId; // Use projectId as appId for Firestore path

    const transactionDocRef = doc(db, `artifacts/${appId}/users/${userId}/customers/${selectedCustomer.id}/transactions/${transactionId}`);

    setDeleteConfirmAction(() => async () => {
      setIsSubmitting(true); // Set submitting state
      try {
        await deleteDoc(transactionDocRef);
        showInfoModal("تم حذف المعاملة بنجاح.");
      } catch (error) {
        console.error("Error deleting transaction:", error);
        showInfoModal(`خطأ في حذف المعاملة: ${error.message}`);
      } finally {
        setShowDeleteConfirmModal(false);
        setDeleteConfirmAction(null);
        setIsSubmitting(false); // Reset submitting state
      }
    });
    setShowDeleteConfirmModal(true);
    setModalMessage("هل أنت متأكد أنك تريد حذف هذه المعاملة؟");
  };

  // Handle editing customer name
  const handleEditCustomerName = async () => {
    if (!db || !userId || !isAuthReady || !selectedCustomer) {
      showInfoModal("الرجاء الانتظار حتى يتم تهيئة التطبيق.");
      return;
    }
    if (isSubmitting) return; // Prevent duplicate submission

    if (!editedCustomerName.trim()) {
      showInfoModal("الرجاء إدخال اسم عميل صالح.");
      return;
    }

    setIsSubmitting(true); // Set submitting state

    // Ensure appId is derived consistently
    const firebaseConfig = { projectId: "YOUR_PROJECT_ID" }; // Placeholder, replace with actual config
    const appId = firebaseConfig.projectId; // Use projectId as appId for Firestore path

    const customerDocRef = doc(db, `artifacts/${appId}/users/${userId}/customers/${selectedCustomer.id}`);

    try {
      await updateDoc(customerDocRef, {
        name: editedCustomerName.trim()
      });
      showInfoModal("تم تحديث اسم العميل بنجاح!");
      setShowEditCustomerNameModal(false);
      // Update the selected customer's name in state immediately
      setSelectedCustomer(prev => ({ ...prev, name: editedCustomerName.trim() }));
    } catch (error) {
      console.error("Error updating customer name:", error);
      showInfoModal(`خطأ في تحديث اسم العميل: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };


  // Calculate total debt for the current customer, considering payment types
  const calculateTotalDebt = useCallback(() => {
    const total = customerTransactions.reduce((sum, transaction) => {
      if (transaction.type === 'payment') {
        return sum - (transaction.value || 0);
      } else { // 'purchase' or undefined (for old transactions)
        return sum + (transaction.value || 0);
      }
    }, 0);
    showInfoModal(`إجمالي الدين لـ ${selectedCustomer.name}: ${total.toFixed(2)}`);
  }, [customerTransactions, selectedCustomer, showInfoModal]); // Added showInfoModal to dependencies

  // Filtered customers for search functionality
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered transactions for date range
  const filteredTransactions = customerTransactions.filter(transaction => {
    const transactionDate = transaction.timestamp ? new Date(transaction.timestamp.toDate()) : null;
    if (!transactionDate) return false;

    let startMatch = true;
    let endMatch = true;

    if (filterStartDate) {
      const start = new Date(filterStartDate);
      start.setHours(0, 0, 0, 0); // Start of the day
      startMatch = transactionDate >= start;
    }

    if (filterEndDate) {
      const end = new Date(filterEndDate);
      end.setHours(23, 59, 59, 999); // End of the day
      endMatch = transactionDate <= end;
    }

    return startMatch && endMatch;
  });

  // Export data functionality
  const handleExport = (type) => {
    let dataToExport = [];
    let filename = '';

    if (type === 'allCustomers') {
      filename = 'customers_summary.csv';
      dataToExport.push("اسم العميل,إجمالي الدين");
      customers.forEach(customer => {
        // To get total debt for each customer, we need to re-calculate it for each customer.
        // For simplicity here, I'll just export customer name. A more robust solution would iterate through all customers and fetch their transactions.
        // For now, let's assume `customerTransactions` is for the `selectedCustomer`.
        // To export all customer debts, we would need to fetch all transactions for all customers.
        // For this iteration, I'll provide an export of the currently viewed customer's transactions or just a list of customer names.
        // Let's refine this to export the current customer's transactions.
      });
      showInfoModal("تصدير جميع العملاء غير مدعوم حاليًا. يرجى تصدير المعاملات لعميل محدد.");
      return; // Exit for now
    } else if (type === 'currentCustomerTransactions' && selectedCustomer) {
      filename = `transactions_${selectedCustomer.name.replace(/\s/g, '_')}.csv`;
      dataToExport.push("التاريخ,التفاصيل,القيمة,النوع,ملاحظات");
      filteredTransactions.forEach(trans => {
        const date = trans.timestamp ? new Date(trans.timestamp.toDate()).toLocaleString('ar-EG') : '';
        dataToExport.push(`${date},"${trans.details}",${trans.value},${trans.type || 'شراء'},"${trans.notes || ''}"`);
      });
    } else {
      showInfoModal("لا توجد بيانات لتصديرها أو لم يتم تحديد عميل.");
      return;
    }

    const csvContent = dataToExport.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showInfoModal("تم تصدير البيانات بنجاح!");
    } else {
      showInfoModal("متصفحك لا يدعم التصدير المباشر. يرجى نسخ المحتوى يدويًا.");
    }
  };


  return (
    <div className="font-inter antialiased text-gray-900 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      {view === 'main' && (
        <MainInterface
          newCustomerName={newCustomerName}
          setNewCustomerName={setNewCustomerName}
          newPurchaseDetails={newPurchaseDetails}
          setNewPurchaseDetails={setNewPurchaseDetails}
          newPurchaseValue={newPurchaseValue}
          setNewPurchaseValue={setNewPurchaseValue}
          newNotes={newNotes}
          setNewNotes={setNewNotes}
          newTransactionType={newTransactionType}
          setNewTransactionType={setNewTransactionType}
          handleAddTransaction={handleAddTransaction}
          setView={setView}
          userId={userId}
          showInfoModal={showInfoModal}
          isSubmitting={isSubmitting} // Pass isSubmitting prop
          customers={customers} // Pass customers for suggestions
          setShowAboutModal={setShowAboutModal} // Pass setShowAboutModal
        />
      )}
      {view === 'customerList' && (
        <CustomerListInterface
          setView={setView}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          customers={filteredCustomers} // Pass filtered customers
          handleSelectCustomer={handleSelectCustomer}
          handleDeleteCustomer={handleDeleteCustomer}
          showInfoModal={showInfoModal}
          setShowAddCustomerModal={setShowAddCustomerModal} // Pass new prop
          isSubmitting={isSubmitting} // Pass isSubmitting prop
        />
      )}
      {view === 'customerDetail' && (
        <CustomerDetailInterface
          setView={setView}
          selectedCustomer={selectedCustomer}
          filterStartDate={filterStartDate}
          setFilterStartDate={setFilterStartDate}
          filterEndDate={filterEndDate}
          setFilterEndDate={setFilterEndDate}
          filteredTransactions={filteredTransactions}
          editingTransactionId={editingTransactionId}
          setEditingTransactionId={setEditingTransactionId}
          editPurchaseDetails={editPurchaseDetails}
          setEditPurchaseDetails={setEditPurchaseDetails}
          editPurchaseValue={editPurchaseValue}
          setEditPurchaseValue={setEditPurchaseValue}
          startEditingTransaction={startEditingTransaction}
          saveEditedTransaction={saveEditedTransaction}
          handleDeleteTransaction={handleDeleteTransaction}
          calculateTotalDebt={calculateTotalDebt}
          handleExport={handleExport}
          newPurchaseDetails={newPurchaseDetails}
          setNewPurchaseDetails={setNewPurchaseDetails}
          newPurchaseValue={newPurchaseValue}
          setNewPurchaseValue={setNewPurchaseValue}
          newTransactionType={newTransactionType}
          setNewTransactionType={setNewTransactionType}
          handleAddTransaction={handleAddTransaction}
          showInfoModal={showInfoModal}
          setShowEditCustomerNameModal={setShowEditCustomerNameModal} // Pass new prop
          isSubmitting={isSubmitting} // Pass isSubmitting prop
        />
      )}

      {showModal && <Modal message={modalMessage} onClose={() => setShowModal(false)} />}
      {showDeleteConfirmModal && (
        <ConfirmModal
          message={modalMessage}
          onConfirm={deleteConfirmAction}
          onCancel={() => {
            setShowDeleteConfirmModal(false);
            setDeleteConfirmAction(null);
          }}
        />
      )}
      <AddCustomerModal
        show={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onAddCustomer={handleAddCustomerFromModal}
        newCustomerName={addCustomerModalName}
        setNewCustomerName={setAddCustomerModalName}
        initialDebtAmount={addCustomerModalInitialDebtAmount}
        setInitialDebtAmount={setAddCustomerModalInitialDebtAmount}
        initialDebtDescription={addCustomerModalInitialDebtDescription}
        setInitialDebtDescription={setAddCustomerModalInitialDebtDescription}
        isSubmitting={isSubmitting} // Pass isSubmitting prop
      />
      <EditCustomerNameModal
        show={showEditCustomerNameModal}
        onClose={() => setShowEditCustomerNameModal(false)}
        onSave={handleEditCustomerName}
        currentName={editedCustomerName}
        setEditedName={setEditedCustomerName}
        isSubmitting={isSubmitting} // Pass isSubmitting prop
      />
      <AboutModal
        show={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  );
};

// Render the App component to the DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
