/**
 * Asado de los Martes - Lógica de la Aplicación
 */

// Estado en memoria
let expenses = []; // Array de { id, name, detail, amount }
let editingId = null;
let currentAttendees = null;

// Elementos del DOM
const form = document.getElementById('expense-form');
const editIdInput = document.getElementById('edit-id');
const nameInput = document.getElementById('person-name');
const detailInput = document.getElementById('expense-detail');
const amountInput = document.getElementById('expense-amount');
const btnSubmitText = document.getElementById('btn-submit-text');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const formTitle = document.getElementById('form-title');
const namesDatalist = document.getElementById('names-datalist');

const expensesList = document.getElementById('expenses-list');
const emptyState = document.getElementById('empty-state');
const expensesCount = document.getElementById('expenses-count');
const quickTotalAmount = document.getElementById('quick-total-amount');
const btnPay = document.getElementById('btn-pay');

// Modal Asistentes
const attendeesModal = document.getElementById('attendees-modal');
const attendeesInput = document.getElementById('attendees-input');
const btnMinusAttendee = document.getElementById('btn-minus-attendee');
const btnPlusAttendee = document.getElementById('btn-plus-attendee');
const btnConfirmAttendees = document.getElementById('btn-confirm-attendees');
const btnCloseModal = document.getElementById('btn-close-modal');
const hintBuyersCount = document.getElementById('hint-buyers-count');

// Sección Resultados
const resultsSection = document.getElementById('results-section');
const metricTotalCost = document.getElementById('metric-total-cost');
const metricAttendeesCount = document.getElementById('metric-attendees-count');
const metricPerPerson = document.getElementById('metric-per-person');
const balancesList = document.getElementById('balances-list');
const btnWhatsapp = document.getElementById('btn-whatsapp');
const btnCopy = document.getElementById('btn-copy');
const btnRecalculateAttendees = document.getElementById('btn-recalculate-attendees');
const btnResetAll = document.getElementById('btn-reset-all');
const toastEl = document.getElementById('toast');

// Utilidades de formato
function formatMoney(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(amount);
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 2600);
}

// Normaliza el nombre para agrupar (manteniendo mayúsculas prolijas)
function capitalizeName(str) {
  if (!str) return '';
  return str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// Obtener lista de compradores únicos
function getUniqueBuyers() {
  const map = new Map();
  expenses.forEach(e => {
    const key = e.name.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, e.name.trim());
    }
  });
  return Array.from(map.values());
}

// Actualizar datalist para autocompletar nombres ya usados
function updateDatalist() {
  const buyers = getUniqueBuyers();
  namesDatalist.innerHTML = buyers.map(name => `<option value="${name}">`).join('');
}

// Renderizar la lista de gastos
function renderExpenses() {
  expensesList.innerHTML = '';
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  
  expensesCount.textContent = expenses.length;
  quickTotalAmount.textContent = formatMoney(total);

  if (expenses.length === 0) {
    emptyState.classList.remove('hidden');
    btnPay.disabled = true;
    resultsSection.classList.add('hidden');
    updateDatalist();
    return;
  }

  emptyState.classList.add('hidden');
  btnPay.disabled = false;
  updateDatalist();

  expenses.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'expense-item';
    itemEl.innerHTML = `
      <div class="expense-info">
        <div class="expense-top">
          <span class="buyer-name">${escapeHTML(item.name)}</span>
        </div>
        <div class="expense-detail">${escapeHTML(item.detail)}</div>
      </div>
      <div class="expense-amount-actions">
        <span class="expense-amount">${formatMoney(item.amount)}</span>
        <div class="item-actions">
          <button type="button" class="action-btn edit-btn" title="Editar compra" data-id="${item.id}">✏️</button>
          <button type="button" class="action-btn delete-btn" title="Eliminar compra" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    `;
    expensesList.appendChild(itemEl);
  });

  // Re-calcular resultados si ya estaban visibles
  if (currentAttendees && !resultsSection.classList.contains('hidden')) {
    calculateAndShowResults(currentAttendees);
  }
}

// Escapar HTML para evitar XSS
function escapeHTML(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

// Agregar o actualizar gasto
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const rawName = nameInput.value;
  const rawDetail = detailInput.value;
  const rawAmount = parseFloat(amountInput.value);

  if (!rawName.trim() || !rawDetail.trim() || isNaN(rawAmount) || rawAmount <= 0) {
    showToast('Por favor completá todos los campos correctamente.');
    return;
  }

  const cleanName = capitalizeName(rawName);

  if (editingId) {
    // Editar
    const index = expenses.findIndex(exp => exp.id === editingId);
    if (index !== -1) {
      expenses[index] = {
        id: editingId,
        name: cleanName,
        detail: rawDetail.trim(),
        amount: rawAmount
      };
      showToast(`Gasto de ${cleanName} actualizado.`);
    }
    cancelEditing();
  } else {
    // Agregar nuevo
    const newExpense = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      name: cleanName,
      detail: rawDetail.trim(),
      amount: rawAmount
    };
    expenses.push(newExpense);
    showToast(`Gasto agregado para ${cleanName}.`);
  }

  form.reset();
  nameInput.focus();
  renderExpenses();
});

// Cancelar edición
function cancelEditing() {
  editingId = null;
  editIdInput.value = '';
  formTitle.innerHTML = '<span class="icon">➕</span> Agregar Compra';
  btnSubmitText.textContent = 'Agregar Gasto';
  btnCancelEdit.classList.add('hidden');
  form.reset();
}

btnCancelEdit.addEventListener('click', cancelEditing);

// Delegación de eventos para editar y eliminar
expensesList.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.edit-btn');
  const deleteBtn = e.target.closest('.delete-btn');

  if (editBtn) {
    const id = editBtn.dataset.id;
    const item = expenses.find(exp => exp.id === id);
    if (!item) return;

    editingId = id;
    editIdInput.value = id;
    nameInput.value = item.name;
    detailInput.value = item.detail;
    amountInput.value = item.amount;

    formTitle.innerHTML = '<span class="icon">✏️</span> Editar Compra';
    btnSubmitText.textContent = 'Guardar Cambios';
    btnCancelEdit.classList.remove('hidden');

    // Desplazar suavemente al formulario en móvil
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
    nameInput.focus();
  }

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const item = expenses.find(exp => exp.id === id);
    if (!item) return;

    if (confirm(`¿Eliminar la compra "${item.detail}" de ${item.name}?`)) {
      expenses = expenses.filter(exp => exp.id !== id);
      if (editingId === id) {
        cancelEditing();
      }
      showToast('Compra eliminada.');
      renderExpenses();
    }
  }
});

// Abrir modal de Asistentes al presionar "PAGAR"
btnPay.addEventListener('click', () => {
  if (expenses.length === 0) return;
  const uniqueBuyers = getUniqueBuyers();
  const minAttendees = Math.max(1, uniqueBuyers.length);

  hintBuyersCount.textContent = `${uniqueBuyers.length} (${uniqueBuyers.join(', ')})`;

  if (!currentAttendees || currentAttendees < minAttendees) {
    attendeesInput.value = minAttendees;
  } else {
    attendeesInput.value = currentAttendees;
  }

  attendeesModal.classList.remove('hidden');
  attendeesInput.focus();
});

// Cerrar modal
btnCloseModal.addEventListener('click', () => {
  attendeesModal.classList.add('hidden');
});

// Controles +/- de asistentes
btnMinusAttendee.addEventListener('click', () => {
  let val = parseInt(attendeesInput.value, 10) || 1;
  const uniqueBuyers = getUniqueBuyers();
  const min = Math.max(1, uniqueBuyers.length);
  if (val > min) {
    attendeesInput.value = val - 1;
  } else {
    showToast(`Mínimo ${min} asistentes (por los que compraron).`);
  }
});

btnPlusAttendee.addEventListener('click', () => {
  let val = parseInt(attendeesInput.value, 10) || 1;
  attendeesInput.value = val + 1;
});

// Confirmar asistentes y calcular
btnConfirmAttendees.addEventListener('click', () => {
  const count = parseInt(attendeesInput.value, 10);
  const uniqueBuyers = getUniqueBuyers();
  const min = Math.max(1, uniqueBuyers.length);

  if (isNaN(count) || count < 1) {
    showToast('Ingresá una cantidad válida de asistentes.');
    return;
  }

  if (count < uniqueBuyers.length) {
    if (!confirm(`Hay ${uniqueBuyers.length} compradores registrados. ¿Seguro que son solo ${count} asistentes?`)) {
      return;
    }
  }

  currentAttendees = count;
  attendeesModal.classList.add('hidden');
  calculateAndShowResults(currentAttendees);

  // Scroll automático hacia la sección de resultados
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }, 100);
});

// Botón para re-calcular asistentes desde la tarjeta de resultados
btnRecalculateAttendees.addEventListener('click', () => {
  btnPay.click();
});

// Lógica de cálculo y renderizado de resultados
function calculateAndShowResults(totalAttendees) {
  const totalCost = expenses.reduce((sum, item) => sum + item.amount, 0);
  const costPerPerson = totalCost / totalAttendees;

  metricTotalCost.textContent = formatMoney(totalCost);
  metricAttendeesCount.textContent = totalAttendees;
  metricPerPerson.textContent = formatMoney(costPerPerson);

  // Agrupar gastos por persona
  const buyerTotals = new Map();
  expenses.forEach(e => {
    const key = e.name.trim();
    const current = buyerTotals.get(key) || { name: key, totalPaid: 0, items: [] };
    current.totalPaid += e.amount;
    current.items.push(e.detail);
    buyerTotals.set(key, current);
  });

  const buyersArray = Array.from(buyerTotals.values());
  const remainingAttendeesCount = Math.max(0, totalAttendees - buyersArray.length);

  balancesList.innerHTML = '';

  // Balances de los compradores
  buyersArray.forEach(buyer => {
    // balance: lo que le corresponde pagar menos lo que ya puso
    // Si puso 50000 y cuota es 6000: balance = 6000 - 50000 = -44000 (A favor / cobra 44000)
    // Si puso 2000 y cuota es 6000: balance = 6000 - 2000 = +4000 (Debe poner 4000)
    const netBalance = costPerPerson - buyer.totalPaid;
    const card = document.createElement('div');

    if (netBalance < -0.01) {
      // Cobra plata (a favor)
      const toReceive = Math.abs(netBalance);
      card.className = 'balance-card receives';
      card.innerHTML = `
        <div class="balance-info">
          <div class="balance-name">${escapeHTML(buyer.name)}</div>
          <div class="balance-sub">Puso ${formatMoney(buyer.totalPaid)} (${buyer.items.join(', ')})</div>
        </div>
        <div class="balance-badge">
          <span class="balance-tag receives">Recibe / A favor</span>
          <div class="balance-amount positive">+${formatMoney(toReceive)}</div>
        </div>
      `;
    } else if (netBalance > 0.01) {
      // Debe poner plata
      card.className = 'balance-card pays';
      card.innerHTML = `
        <div class="balance-info">
          <div class="balance-name">${escapeHTML(buyer.name)}</div>
          <div class="balance-sub">Puso ${formatMoney(buyer.totalPaid)}, le faltan ${formatMoney(netBalance)}</div>
        </div>
        <div class="balance-badge">
          <span class="balance-tag pays">Debe poner</span>
          <div class="balance-amount negative">${formatMoney(netBalance)}</div>
        </div>
      `;
    } else {
      // Saldado justo
      card.className = 'balance-card settled';
      card.innerHTML = `
        <div class="balance-info">
          <div class="balance-name">${escapeHTML(buyer.name)}</div>
          <div class="balance-sub">Puso exacto lo que le correspondía</div>
        </div>
        <div class="balance-badge">
          <span class="balance-tag settled">Saldado</span>
          <div class="balance-amount neutral">$0</div>
        </div>
      `;
    }

    balancesList.appendChild(card);
  });

  // Asistentes restantes (que no compraron nada)
  if (remainingAttendeesCount > 0) {
    const remainingCard = document.createElement('div');
    remainingCard.className = 'balance-card remaining-card';
    remainingCard.innerHTML = `
      <div class="balance-info">
        <div class="balance-name">👥 ${remainingAttendeesCount} ${remainingAttendeesCount === 1 ? 'asistente restante' : 'asistentes restantes'}</div>
        <div class="balance-sub">No realizaron compras previas</div>
      </div>
      <div class="balance-badge">
        <span class="balance-tag remaining">Debe poner c/u</span>
        <div class="balance-amount negative">${formatMoney(costPerPerson)}</div>
      </div>
    `;
    balancesList.appendChild(remainingCard);
  }

  resultsSection.classList.remove('hidden');
}

// Generar texto para WhatsApp y portapapeles
function buildSummaryText() {
  const totalCost = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalAttendees = currentAttendees || 1;
  const costPerPerson = totalCost / totalAttendees;

  const buyerTotals = new Map();
  expenses.forEach(e => {
    const key = e.name.trim();
    const current = buyerTotals.get(key) || { name: key, totalPaid: 0, items: [] };
    current.totalPaid += e.amount;
    current.items.push(e.detail);
    buyerTotals.set(key, current);
  });

  const buyersArray = Array.from(buyerTotals.values());
  const remainingAttendeesCount = Math.max(0, totalAttendees - buyersArray.length);

  let text = `🥩 *Asado de los Martes - División de Gastos* 🥩\n\n`;
  text += `💰 *Total Gastado:* ${formatMoney(totalCost)}\n`;
  text += `👥 *Asistentes:* ${totalAttendees} personas\n`;
  text += `💵 *Cuota por persona:* ${formatMoney(costPerPerson)}\n\n`;

  text += `📋 *Detalle de Compras:*\n`;
  expenses.forEach(exp => {
    text += ` • ${exp.name}: ${exp.detail} (${formatMoney(exp.amount)})\n`;
  });
  text += `\n`;

  text += `⚖️ *Balance Final:*\n`;
  buyersArray.forEach(buyer => {
    const netBalance = costPerPerson - buyer.totalPaid;
    if (netBalance < -0.01) {
      text += `🟢 *${buyer.name}:* Le deben devolver ${formatMoney(Math.abs(netBalance))} (puso ${formatMoney(buyer.totalPaid)})\n`;
    } else if (netBalance > 0.01) {
      text += `🔴 *${buyer.name}:* Debe poner ${formatMoney(netBalance)} (puso ${formatMoney(buyer.totalPaid)})\n`;
    } else {
      text += `⚪ *${buyer.name}:* Saldado (puso exacto ${formatMoney(buyer.totalPaid)})\n`;
    }
  });

  if (remainingAttendeesCount > 0) {
    text += `🔴 *Los ${remainingAttendeesCount} asistentes restantes:* Deben poner ${formatMoney(costPerPerson)} cada uno\n`;
  }

  text += `\n🔥 _Calculado con Asado de los Martes_`;
  return text;
}

// Enviar por WhatsApp
btnWhatsapp.addEventListener('click', () => {
  const text = buildSummaryText();
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
});

// Copiar al portapapeles
btnCopy.addEventListener('click', async () => {
  const text = buildSummaryText();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback para navegadores antiguos
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast('¡Resumen copiado al portapapeles! 📋');
  } catch (err) {
    showToast('No se pudo copiar automáticamente.');
  }
});

// Reiniciar todo el asado
btnResetAll.addEventListener('click', () => {
  if (confirm('¿Querés reiniciar todo el asado y borrar la lista de compras?')) {
    expenses = [];
    currentAttendees = null;
    cancelEditing();
    renderExpenses();
    showToast('Asado reiniciado.');
  }
});

// Inicialización
renderExpenses();

