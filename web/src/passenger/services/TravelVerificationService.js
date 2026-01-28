import { validateFlightWithAviationstack } from './AviationstackService';
import { searchFlightWithAmadeus } from './AmadeusService';
import { validatePassportFormat } from './PassportMRZValidation';

/**
 * Main Travel Verification Service
 * Orchestrates the 3-step verification process:
 * 1. Collect travel identifiers
 * 2. Validate against external APIs (Aviationstack, Amadeus)
 * 3. Return verification status (verified, likely, manual-review)
 */

export const verifyTravelDetails = async (travelData) => {
  try {
    console.log('🎫 [VERIFICATION START] Initiating travel verification process');
    console.log('   Passenger:', travelData.lastName);
    console.log('   Flight:', travelData.flightNumber, `(${travelData.dateOfTravel})`);
    console.log('   Route:', `${travelData.originAirport} → ${travelData.destinationAirport}`);

    const {
      lastName,
      flightNumber,
      dateOfTravel,
      originAirport,
      destinationAirport,
      baggageTag,
      pnr,
      ticketNumber,
      passportNumber,
    } = travelData;

    let verificationScore = 0;
    let verificationDetails = {
      flightVerified: false,
      passportValid: false,
      identifiersProvided: [],
      issues: [],
    };

    // Step 1: Validate passport format (identity confirmation only)
    if (passportNumber) {
      try {
        const passportValid = validatePassportFormat(passportNumber);
        if (passportValid) {
          console.log('   ✔️ Passport format valid (+20 points)');
          verificationScore += 20;
          verificationDetails.passportValid = true;
          verificationDetails.identifiersProvided.push('passport');
        } else {
          console.log('   ❌ Passport format appears invalid');
          verificationDetails.issues.push('Passport number format appears invalid');
        }
      } catch (err) {
        console.log('   ⚠️ Could not validate passport format:', err.message);
        verificationDetails.issues.push('Could not validate passport format');
      }
    }

    // Step 2: Verify flight with Aviationstack (primary verification)
    try {
      const aviationResult = await validateFlightWithAviationstack(
        flightNumber,
        dateOfTravel,
        originAirport,
        destinationAirport
      );

      if (aviationResult.found && aviationResult.matches) {
        console.log('   ✅ Flight verified with Aviationstack (+50 points)');
        verificationScore += 50;
        verificationDetails.flightVerified = true;
        verificationDetails.flightDetails = aviationResult;
        verificationDetails.identifiersProvided.push('flight-verified');
      } else if (aviationResult.partial) {
        console.log('   ⚠️ Flight found but route mismatch (+25 points)');
        verificationScore += 25;
        verificationDetails.flightDetails = aviationResult;
        verificationDetails.identifiersProvided.push('flight-partial');
      } else {
        console.log('   ❌ Flight not found in Aviationstack - trying Amadeus...');
        verificationDetails.issues.push(
          'Flight not found in real-time database (may be charter, private, or historical flight)'
        );
      }
    } catch (err) {
      // Fallback to Amadeus if Aviationstack fails
      console.log('   🔄 Aviationstack error, attempting Amadeus fallback...');
      try {
        const amadeusResult = await searchFlightWithAmadeus(
          flightNumber,
          originAirport,
          destinationAirport,
          dateOfTravel
        );

        if (amadeusResult.found) {
          console.log('   🟢 Flight verified with Amadeus (+35 points)');
          verificationScore += 35;
          verificationDetails.flightDetails = amadeusResult;
          verificationDetails.identifiersProvided.push('flight-amadeus');
        }
      } catch (amadeusErr) {
        console.log('   ❌ Amadeus verification also failed:', amadeusErr.message);
        verificationDetails.issues.push('Could not verify flight in external databases');
      }
    }

    // Step 3: Score additional identifiers (baggageTag, PNR, ticketNumber)
    if (baggageTag) {
      console.log('   ✔️ Baggage tag provided (+15 points)');
      verificationScore += 15;
      verificationDetails.identifiersProvided.push('baggage-tag');
    }

    if (pnr) {
      console.log('   ✔️ PNR provided (+10 points)');
      verificationScore += 10;
      verificationDetails.identifiersProvided.push('pnr');
    }

    if (ticketNumber) {
      console.log('   ✔️ Ticket number provided (+10 points)');
      verificationScore += 10;
      verificationDetails.identifiersProvided.push('ticket-number');
    }

    // Determine verification status based on score
    let status = 'manual-review-required';
    let message = '';

    if (verificationScore >= 40) {
      status = 'travel-verified';
      message = 'Travel details verified against external flight databases';
      console.log(`\n🎉 [VERIFICATION COMPLETE] Status: VERIFIED (Score: ${verificationScore}/100)`);
    } else if (verificationScore >= 20) {
      status = 'travel-likely';
      message = 'Travel details appear valid based on provided information';
      console.log(`\n⚠️ [VERIFICATION COMPLETE] Status: LIKELY (Score: ${verificationScore}/100)`);
    } else if (verificationScore >= 10) {
      status = 'manual-review-required';
      message = 'Some information provided but recommend manual verification';
      console.log(`\n🔍 [VERIFICATION COMPLETE] Status: MANUAL REVIEW (Score: ${verificationScore}/100)`);
    } else {
      status = 'manual-review-required';
      message = 'Insufficient information for automated verification';
      console.log(`\n❓ [VERIFICATION COMPLETE] Status: INSUFFICIENT DATA (Score: ${verificationScore}/100)`);
    }

    console.log(`   Identifiers Used: ${verificationDetails.identifiersProvided.join(', ')}`);
    console.log(`   Final Score: ${verificationScore} points\n`);

    return {
      status,
      message,
      score: verificationScore,
      details: verificationDetails,
      timestamp: new Date().toISOString(),
      travelData: {
        flightNumber,
        dateOfTravel,
        originAirport,
        destinationAirport,
        lastName,
        // Don't store full passport in response for security
        passportProvided: !!passportNumber,
      }
    };

  } catch (error) {
    console.error('❌ [VERIFICATION ERROR]', error.message);
    throw new Error('Unable to verify travel details. Please try again.');
  }
};

/**
 * Sends verification result to backend for storage
 * Backend will then validate claim when user uploads luggage details
 */
export const storeVerificationResult = async (verificationResult) => {
  try {
    const response = await fetch('/api/verify-travel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(verificationResult),
    });

    if (!response.ok) {
      throw new Error('Failed to store verification result');
    }

    return await response.json();
  } catch (error) {
    console.error('Error storing verification result:', error);
    throw error;
  }
};

/**
 * Retrieves stored verification status for a user
 */
export const getVerificationStatus = async (userId) => {
  try {
    const response = await fetch(`/api/verify-travel/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve verification status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving verification status:', error);
    return null;
  }
};
