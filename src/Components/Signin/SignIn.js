import React from "react";

class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            SignInEmail: '',
            SignInPassword: '',
            error: '',
            isSubmitting: false
        }
    }
    onEmailChange = (event) => {
        this.setState({ SignInEmail: event.target.value });
    }

    onPasswordChange = (event) => {
        this.setState({ SignInPassword: event.target.value });
    }
     
    onSubmitSignIn = async () => {
        const { SignInEmail, SignInPassword } = this.state;
        const email = (SignInEmail || '').trim().toLowerCase();
        const password = (SignInPassword || '').trim();
        if (!email || !password) {
            this.setState({ error: 'Inserisci email e password' });
            return;
        }
        this.setState({ isSubmitting: true, error: '' });
        try {
            const response = await fetch('http://localhost:3000/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            // Leggi il body una sola volta come testo e prova a trasformarlo in JSON
            const raw = await response.text().catch(() => '');
            let data = null;
            try { data = raw ? JSON.parse(raw) : null; } catch (_) { data = null; }

            if (response.ok) {
                // Caso 1: oggetto utente
                if (data && (data.id || (data.user && data.user.id))) {
                    const payload = data.user ? data.user : data;
                    if (this.props.loadUser) this.props.loadUser(payload);
                    this.props.onRouteChange('home');
                    return;
                }
                // Caso 2: semplice stringa "success"
                if (raw && raw.toLowerCase().includes('success')) {
                    this.props.onRouteChange('home');
                    return;
                }
            }

            const errMessage = (data && (data.error || data.message)) || raw || 'Email o password non validi';
            this.setState({ error: errMessage, isSubmitting: false });
        } catch (error) {
            this.setState({ error: 'Errore di rete. Riprova.', isSubmitting: false });
        }
    }

    render() {
        const { onRouteChange } = this.props;
        return (
            <article className="br3 ba dark-gray b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
            <main className="pa4 black-80">
                <form className="measure">
                    <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                        <legend className="f1 fw6 ph0 mh0">Sign In</legend>
                        <div className="mt3">
                            <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                            <input
                             className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                             type="email"
                              name="email-address" 
                              id="email-address" 
                              onChange={this.onEmailChange}
                              />
                        </div>
                        <div className="mv3">
                            <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                            <input className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                            type="password"
                             name="password" 
                             id="password" 
                             onChange={this.onPasswordChange}
                             />
                        </div>
                    </fieldset>
                    <div className="">
                        <button 
                        type="button"
                        onClick={this.onSubmitSignIn}
                        disabled={this.state.isSubmitting}
                        className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib">
                            Sign in
                        </button>
                    </div>
                    {this.state.error && (
                        <div className="dark-red mt3">
                            {this.state.error}
                        </div>
                    )}
                    <div className="lh-copy mt3">
                        <p onClick={() => this.props.onRouteChange('register')} className="f6 link dim black db pointer">Register</p>
                    </div>
                </form>
            </main>
            </article>
        );
    }
}
export default SignIn;




