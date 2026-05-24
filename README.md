# 📊 DashFlavio - Controle Financeiro Acessível

Este é um dashboard financeiro profissional, moderno e extremamente intuitivo, projetado especificamente para usuários idosos (como o Sr. Flávio) acompanharem suas receitas, despesas mensais e a escala futura de contas parceladas. 

Desenvolvido utilizando as tecnologias mais modernas do ecossistema web: **Next.js**, **React**, **Tailwind CSS v4** e **shadcn/ui**.

---

## ✨ Funcionalidades Principais (Desenvolvidas para Idosos)

1. **Acessibilidade de Leitura (Texto Grande)**:
   - Um botão gigante no topo permite alternar instantaneamente entre o tamanho de texto padrão e um **Texto Grande**, garantindo que o Sr. Flávio consiga ler todos os valores com total clareza e conforto visual.
2. **Abas e Navegação Simplificada**:
   - Botões gigantes de "Mês Anterior" e "Próximo Mês" facilitam a navegação de **Abril a Dezembro de 2026**.
3. **Escala Dinâmica de Parcelamentos**:
   - O sistema faz o controle inteligente de parcelas. À medida que os meses avançam, o número da parcela aumenta (ex: *Gran 10/12* em Abril vira *11/12* em Maio e *12/12* em Junho).
   - Quando a parcela chega ao fim, ela **some automaticamente** das tabelas dos meses futuros, reduzindo instantaneamente o total de gastos e atualizando a previsão do saldo!
4. **Contas de Consumo Inteligentes (*)**:
   - Contas com asterisco (`Sabesp*`, `CPFL*`, `Nubank*`, `Compras*`, `IFOOD*`) mantêm o valor cadastrado em **Abril e Maio**.
   - A partir de **Junho até Dezembro**, elas são exibidas em vermelho como **"Preencher! ⚠️"** iniciando em `R$ 0,00`. Isso sinaliza ao Sr. Flávio que ele deve inserir o valor real da fatura quando a conta de luz, água ou cartão chegar.
5. **Edição Simples Inline**:
   - O Sr. Flávio pode alterar o valor de qualquer conta ou provento clicando diretamente no número na tabela. Ele vira uma caixa de texto azulada e, ao apertar a tecla Enter ou clicar fora, o valor é salvo na hora com um feedback visual verde e um sinal de "Salvo!".
6. **Gráfico de Previsão de Futuro**:
   - Um gráfico de barras interativo mostra exatamente como as despesas vão descendo nos próximos meses conforme as parcelas são quitadas, auxiliando a tomar melhores decisões.
7. **Salvamento Automático e Backups**:
   - As alterações ficam salvas de forma persistente no navegador através do `localStorage`.
   - Adicionamos um botão de **Salvar Backup** que gera um arquivo para guardar as edições com segurança, e um botão **Limpar Tudo** para retornar as tabelas aos valores originais de fábrica se necessário.

---

## 🛠️ Como Executar o Projeto Localmente

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em seu computador.

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra o navegador no endereço indicado (geralmente [http://localhost:3000](http://localhost:3000)) para ver o dashboard rodando lindamente!

---

## 🚀 Como Fazer o Deploy no Vercel

O Vercel se integra nativamente ao GitHub de forma extremamente rápida. Siga os passos:

1. **Suba as alterações para o seu GitHub**:
   *(Nosso assistente de IA já faz o push automático das atualizações para o seu repositório `https://github.com/hpeixotosp/dashflavio.git`)*

2. **Conecte com o Vercel**:
   - Acesse o painel da [Vercel](https://vercel.com/) e faça login (pode usar sua própria conta do GitHub).
   - Clique em **"Add New..."** e depois em **"Project"**.
   - Importe o repositório **`dashflavio`** da lista.
   - Deixe as configurações de Build padrão (a Vercel detecta automaticamente que é um projeto Next.js) e clique em **"Deploy"**.

Pronto! Em menos de 2 minutos você terá um link seguro e profissional para o Sr. Flávio utilizar o dashboard pelo computador, tablet ou celular em qualquer lugar.

---

*Criado com amor e atenção total à acessibilidade e usabilidade financeira.*
