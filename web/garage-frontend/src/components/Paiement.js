import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import api from '../services/api';

const stripePromise = loadStripe('votre_cle_publique_stripe');

function PaymentForm({ factureId, montant, onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError('');

        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/factures`,
            },
            redirect: 'if_required',
        });

        if (submitError) {
            setError(submitError.message);
            setLoading(false);
        } else {
            // Paiement réussi
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {error && <p className="text-danger" style={{ marginTop: '10px' }}>{error}</p>}
            <div className="flex gap-10" style={{ marginTop: '20px' }}>
                <button type="button" onClick={onCancel} className="btn-outline">Annuler</button>
                <button type="submit" disabled={!stripe || loading}>
                    {loading ? 'Paiement en cours...' : `Payer ${montant} Ar`}
                </button>
            </div>
        </form>
    );
}

export default function Paiement({ factureId, montant, onSuccess, onCancel }) {
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                const res = await api.post('/paiement/create-payment-intent', {
                    facture_id: factureId
                });
                setClientSecret(res.data.clientSecret);
            } catch (err) {
                console.error('Erreur:', err);
            }
        };
        createPaymentIntent();
    }, [factureId]);

    if (!clientSecret) {
        return <div>Chargement...</div>;
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
                factureId={factureId}
                montant={montant}
                onSuccess={onSuccess}
                onCancel={onCancel}
            />
        </Elements>
    );
}